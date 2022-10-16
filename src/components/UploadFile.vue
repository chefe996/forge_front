<template>
    <div id="UploadFile">
        <ModelsList v-if="!visibleForge"/>
        <div class="upload" v-show="!visibleForge" v-cloak @drop.prevent="addFile" @dragover.prevent>
            {{ processing }}
        </div>
        <ForgeViewer v-if="visibleForge" v-bind:urn="urn" v-bind:access_token="access_token" v-bind:mode="mode"/>
    </div>
</template>

<script>
    import util from "util"
    import axios from "axios"
    import ForgeViewer from './ForgeViewer.vue'
    import ModelsList from './ModelsList.vue'

    export default {
        name: 'UploadFile',
        components: {
            ForgeViewer,
            ModelsList
        },
        data() {
            return {
                visibleForge: false,
                access_token: null,
                urn: null,
                mode: null,
                processing: 'Drop model here',
                id: 0
            }
        },
        methods: {
            async upload(file) {
                this.processing = 'Upload model...'

                let formData = new FormData();
                formData.append('file', file);

                const args = {
                    url: '/upload',
                    method: 'POST',
                    headers: {
                        'content-type': 'multipart/form-data'
                    },
                    onUploadProgress: function (e) {
                        this.processing = util.format('Uploading model %s% complete', Math.round((e.loaded / e.total) * 100))
                    }.bind(this),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                    data: formData
                }

                const response = await axios(args)

                console.log(response.data)

                const interval = setInterval(async () => {
                    const translate = await this.check_translate(response.data.urn)

                    if (translate.status === 'success') {
                        clearInterval(interval)

                        this.access_token = response.data.access_token
                        this.urn = response.data.urn
                        this.visibleForge = true

                        this.processing = 'Model prepared successfully'
                    } else {
                        this.processing = 'Model preparing ' + translate.progress
                    }
                }, 1000)
            },
            async check_translate(urn) {
                const args = {
                    url: '/check_translate',
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: {
                        "urn": urn
                    }
                }

                const response = await axios(args)

                return response.data.check_translate
            },
            async addFile(e) {
                let droppedFiles = e.dataTransfer.files
                if (!droppedFiles) return

                await this.upload(droppedFiles[0])
            },

            mounted() {

            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .upload {
        display: block;
        height: 100vh;
        background: #ccc;
        line-height: 100vh;
        text-align: center;
        position: absolute;
        top: 0;
        left: 30%;
        right: 0;
        font-size: 2.4em;
    }
</style>
