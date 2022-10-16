<template>
    <div>
    <div v-if="mode">
        <div id="forgeViewer" style="left: 1% !important;"></div>
    </div>
    <div v-else>
        <ForgeLayers v-if="layersVisible"/>
        <ForgeProps v-if="layersVisible"/>
        <div id="forgeViewer" ></div>
    </div>
    </div>
</template>

<script>
    import axios from "axios"
    import ForgeLayers from './ForgeLayers.vue'
    import ForgeProps from './ForgeProps.vue'

    export default {
        name: 'ForgeViewer',
        components: {
            ForgeLayers,
            ForgeProps
        },
        props: {
            access_token: null,
            urn: null,
            mode: null
        },
        data() {
            return {
                mode2: this.mode,
                layersVisible: false,
                dbIds: [],
                tree: [],
                props: [],
                viewer: null,
                options: {
                    env: 'AutodeskProduction2',
                    api: 'streamingV2',
                    getAccessToken: (onTokenReady) => {
                        let timeInSeconds = 3600
                        onTokenReady(this.access_token, timeInSeconds)
                    }
                },
                config: {
                    extensions: ['ToolbarExtension']
                }
            }
        },
        methods: {
            buildModelTree() {
                this.dbIds = []

                const interval = setInterval(() => {
                    if (this.viewer.model) {
                        clearInterval(interval)

                        //builds model tree recursively
                        const recursive = (node) => {
                            it.enumNodeChildren(node.dbId, (childId) => {
                                node.children = node.children || []

                                const childNode = {
                                    dbId: childId,
                                    name: it.getNodeName(childId)
                                }
                                node.children.push(childNode)
                                this.dbIds.push(childId)

                                recursive(childNode)
                            })
                        }

                        const it = this.viewer.model.getData().instanceTree
                        const rootId = it.getRootId()

                        this.dbIds.push(rootId)
                        this.tree = {
                            dbId: rootId,
                            name: it.getNodeName(rootId)
                        }

                        recursive(this.tree)

                        // Get props
                        this.viewer.model.getBulkProperties(this.dbIds, null, (props) => {
                            this.props = props
                        })

                        this.createTree()
                        this.createProps()
                    }
                }, 500)
            },

            formChange() {
                const form = document.getElementById('ForgeLayers')
                const inputs = form.querySelectorAll('input[type="checkbox"]')
                const checked = []

                for (const key in inputs) {
                    const input = inputs[key]
                    const parent = document.getElementById(input.name)

                    if (parent) {
                        parent.className = ''

                        if (input.checked === true) {
                            parent.className = 'selected'
                        }
                    }

                    if (input.checked === true) {
                        checked.push(input.name)
                    }
                }

                this.viewer.fitToView(checked)
                // if (event) {
                //   this.viewer.select(checked)
                // }

                const forgeProps = this.$children.find((element) => {
                    if (element.$options.name === 'ForgeProps') {
                        return true
                    }
                })

                forgeProps.setChecked(checked)
            },

            async createTree() {
                const args = {
                    url: '/create_tree',
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: {
                        urn: this.urn,
                        tree: this.tree
                    }
                }

                await axios(args)
                this.layersVisible = true

                // Work with custom layers
                const interval = setInterval(() => {
                    const form = document.getElementById('ForgeLayers')
                    if (form) {
                        clearInterval(interval)

                        form.addEventListener('change', this.formChange)
                    }
                }, 500)
            },

            async createProps() {
                const interval = setInterval(async () => {
                    if (this.dbIds.length === this.props.length) {
                        clearInterval(interval)

                        const args = {
                            url: '/create_props',
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            data: {
                                urn: this.urn,
                                props: this.props
                            }
                        }

                        await axios(args)
                    }
                }, 500)
            }
        },
        async created() {
            // Exts
            function ToolbarExtension(viewer, options) {
                window.Autodesk.Viewing.Extension.call(this, viewer, options)
            }

            ToolbarExtension.prototype = Object.create(window.Autodesk.Viewing.Extension.prototype)
            ToolbarExtension.prototype.constructor = ToolbarExtension

            ToolbarExtension.prototype.load = function () {
                this.viewer.fitToView()

                console.log('ToolbarExtension loaded')

                return true
            }

            ToolbarExtension.prototype.onToolbarCreated = function (toolbar) {
                toolbar.removeControl('settingsTools')


                console.log('Toolbar created')
            }

            window.Autodesk.Viewing.theExtensionManager.registerExtension('ToolbarExtension', ToolbarExtension)


            // Create viewer
            window.Autodesk.Viewing.Initializer(this.options, () => {
                let htmlDiv = document.getElementById('forgeViewer')
                this.viewer = new window.Autodesk.Viewing.GuiViewer3D(htmlDiv, this.config)


                let status_code = this.viewer.start()


                if (status_code > 0) {
                    console.error('Failed to create a Viewer: WebGL not supported.')
                    return
                }
                console.log('Initialization complete, loading a model next...')

                // const profileSettings = window.Autodesk.Viewing.ProfileSettings.Navis;
                // const profile = new window.Autodesk.Viewing.Profile(profileSettings);
                // this.viewer.setProfile(profile);

                window.Autodesk.Viewing.Document.load('urn:' + this.urn, (viewerDocument) => {
                    this.viewer.loadExtension('Autodesk.DocumentBrowser')
                    this.viewer.loadExtension('Autodesk.BimWalk')
                    this.viewer.loadExtension('Autodesk.FullScreen')
                    this.viewer.loadExtension('Autodesk.LayerManager')
                    this.viewer.loadExtension('Autodesk.ModelStructure')
                    this.viewer.loadExtension('Autodesk.PropertiesManager')
                    this.viewer.loadExtension('Autodesk.Section')
                    this.viewer.loadExtension('Autodesk.Viewing.ZoomWindow')


                    const defaultModel = viewerDocument.getRoot().getDefaultGeometry()
                    this.viewer.loadDocumentNode(viewerDocument, defaultModel)
                    console.log('Document loaded successful')

                    this.viewer.addEventListener(window.Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
                        this.buildModelTree()
                    })

                    this.viewer.addEventListener(window.Autodesk.Viewing.SELECTION_CHANGED_EVENT, (e) => {
                        const form = document.getElementById('ForgeLayers')
                        const layers = form.querySelectorAll('li')

                        for (const key in layers) {
                            const layer = layers[key]

                            if (layer) {
                                if (layer.className === 'selected') {
                                    const parent = layer.closest('ul')
                                    const checkbox = layer.querySelector('input[type="checkbox"]')

                                    layer.className = ''
                                    checkbox.checked = false
                                    parent.style.display = 'none'
                                }
                            }
                        }

                        const recursive = (layer) => {
                            const parent = layer.closest('ul')

                            if (parent) {
                                parent.style.display = 'block'

                                const layer = parent.closest('li')
                                if (layer) {
                                    recursive(layer)
                                }
                            }
                        }

                        for (const key in e.dbIdArray) {
                            const dbId = e.dbIdArray[key]
                            const layer = document.getElementById(dbId)
                            const checkbox = layer.querySelector('input[type="checkbox"]')

                            layer.className = 'selected'
                            checkbox.checked = true

                            recursive(layer)
                        }

                        this.formChange()
                    })
                }, () => {
                    console.error('Failed fetching Forge manifest')
                })
            })
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    body {
        margin: 0;
    }

    #forgeViewer {
        height: 70%;
        margin: 0;
        background-color: #F0F8FF;
        position: absolute;
        top: 0;
        left: 30%;
        right: 0;
    }


</style>
