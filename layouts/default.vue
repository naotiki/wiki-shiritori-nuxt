<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary

    >
      <div class="text-center text-h5 ma-1">
        Wikipedia しりとりAI
      </div>
      <v-list>
        <v-list-item @click.stop="aboutDialog=true">
          <v-list-item-action>
            <v-icon>
              mdi-information
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>
              Wikiしりとりについて
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/naotiki/wiki-shiritori-nuxt"
        >
          <v-list-item-action>
            <v-icon>
              mdi-github
            </v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>wiki-shiritori-nuxt</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-dialog v-model="aboutDialog">
      <v-card>
        <v-card-title class="text-h5">
          <a target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/naotiki/wiki-shiritori-nuxt">Wikiしりとり</a>について
        </v-card-title>
        <v-card-subtitle>by <a href="https://github.com/naotiki/" target="_blank"
                               rel="noopener noreferrer">Naotiki</a></v-card-subtitle>
        <v-card-text class="text-pre-line">
          「Wiki しりとりAI」は、 gooラボの<a href="https://labs.goo.ne.jp/api/jp/hiragana-translation/" target="_blank" rel="noopener noreferrer">ひらがな化API</a>を使用しています。
          「ん」でも返してきます。クソ強いです。
          バグが起きたらあなたの勝ちです。
          漢字の読み間違いは仕様なので許してください。
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"/>
      <v-toolbar-title>Wikiしりとり</v-toolbar-title>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt/>
      </v-container>
    </v-main>

    <v-footer
      app
    >
      <span>&copy;<a href="https://github.com/naotiki/" target="_blank"
                     rel="noopener noreferrer">Naotiki</a> {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data() {
    return {
      aboutDialog:false,
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'しりとり',
          to: '/'
        },
      ],
      title: 'Vuetify.js'
    }
  }
}
</script>
