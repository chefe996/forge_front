<template>
    <div id="ModelsList">
        <ul>
            <li v-for="file in files" :key="file.name" v-on:click="loadModel(file.urn)">
                <div class="title">{{ file.name }}</div>
                <div class="date">{{ file.createdAt }}</div>
            </li>
        </ul>
    </div>
</template>

<script>
    import axios from "axios"

    export default {
        name: 'ModelsList',
        data() {
            return {
                access_token: null,
                files: [],
                urn: '',
                mode: true,
            }
        },
        async mounted() {
            const args = {
                url: '/get_models',
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            }

            const response = await axios(args)

            this.access_token = response.data.access_token
            this.files = response.data.models

            let hash = location.hash;

            if (hash != '') {
                hash = hash.slice(1)
                this.mode = hash.startsWith('1');
                hash = hash.slice(1)
                // console.log(hash)
                this.loadModel(hash)
            }

            console.log(response.data)
        },
        methods: {
            loadModel(urn) {
                console.log(urn)
                console.log('mode='+this.mode)

                this.$parent.access_token = this.access_token
                this.$parent.urn = urn
                this.$parent.visibleForge = true
                this.$parent.mode = this.mode
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    #ModelsList {
        display: block;
        height: 100vh;
        background: #fff;
        text-align: left;
        position: absolute;
        top: 0;
        left: 0;
        right: 70%;
        font-size: 1.2em;
        overflow: auto;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    ul li {
        cursor: pointer;
        padding: 20px;
        transition: all .1s;
    }

    ul li:hover {
        background: #F0F8FF;
    }

    .title {
        font-size: 1.0em;
        text-align: left;
        color: #2c3e50;
        font-weight: bolder;
    }

    .date {
        font-size: 0.7em;
        margin-top: 15px;
        text-align: right;
        color: green;
    }
</style>
