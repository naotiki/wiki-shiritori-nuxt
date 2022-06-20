<template>
  <v-container>
    <v-container ref="messageListRef" class="message-list">
      <balloon-box direction="left">
        <p>ルール</p>
        <ul>
          <li>「ん」でも返します</li>
          <li>英語や漢字は読み間違えます</li>
          <li>ガバガバだけど許してくださいおねがいします</li>
        </ul>
      </balloon-box>
      <template v-for="(balloon, index) in balloons">
        <balloon-box :key="index" :direction="balloon.dir">
          <a
            v-if="balloon.url"
            :href="balloon.url"
            target="_blank"
            rel="noopener noreferrer">
            {{ balloon.text }}
          </a>
          <template v-else>{{ balloon.text }}</template>
        </balloon-box>
      </template>
    </v-container>

    <v-text-field
      v-model="inputText"
      :placeholder="`「${nextWord}」から始まる言葉`"
      @keydown="onKeyDown">
      <template #append-outer>
        <v-btn
          icon
          :disabled="!inputText || inProcessing"
          color="blue"
          @click="send">
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </template>
    </v-text-field>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue"
import toUpper, {hiraToKana, kanaToHira} from "~/scripts/HiraganaConverter"
import BalloonBox from "~/components/balloon.vue"

const wikiPageURL = "https://ja.wikipedia.org/?curid="
const dbName = "wiki_shiritori_history"
export default Vue.extend({
  name: "IndexPage",
  components: {BalloonBox},

  data() {
    return {
      inProcessing: false,
      inputText: "",
      histories: [
        {
          word: "しりとり",
          pageId: "20287",
        },
      ] as Array<WordHistory>,
      balloons: [] as Array<BalloonSay>,
      nextWord: "り",
    }
  },
  mounted() {
    if (localStorage.getItem(dbName) != null) {
      const isLoad = confirm(
        "セーブデータがあります。\n読み込む場合は「OK」\n削除して新しく始める場合は「キャンセル」"
      )
      if (isLoad) {
        this.parseSaveData()
      } else {
        localStorage.removeItem(dbName)
        this.say({
          text: "「しりとり」",
          dir: "left",
          url: wikiPageURL + "20287",
        })
      }
    } else {
      this.say({
        text: "「しりとり」",
        dir: "left",
        url: wikiPageURL + "20287",
      })
    }
  },
  methods: {
    onKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        this.send()
      }
    },
    // 働き者
    send() {
      if (!this.inputText || this.inProcessing) return
      this.inProcessing = true
      this.say({text: `「${this.inputText}」`, dir: "right"})
      this.shiritoriLogic(this.inputText).finally(() => {
        this.inputText = ""
        this.inProcessing = false
      })
    },
    async shiritoriLogic(input: string) {
      const firstLetter = await this.parseString(input, true)
      if (this.nextWord !== firstLetter[0]) {
        this.say({
          text: `「${this.nextWord}」から言葉を初めてね！`,
          dir: "left",
        })
        return
      }
      console.log(this.histories, ":", input)
      if (this.isUsedWord(input)) {
        this.say({text: `「${input}」はもう使われた言葉だよ！`, dir: "left"})
        return
      }
      this.histories.push({
        word: input,
        pageId: null,
      })
      const lastUserStrings = await this.parseString(input, false)
      const [hiraganaResult, katakanaResult] = await Promise.all([
        this.wikipediaSearch(lastUserStrings[0]),
        this.wikipediaSearch(lastUserStrings[1]),
      ])
      const words = hiraganaResult[0].concat(katakanaResult[0])
      const pageIds = hiraganaResult[1].concat(katakanaResult[1])
      if (words === []) {
        this.say({text: "致命的なエラー:負けました", dir: "left"})
        console.error("強すぎException")
        return
      }
      let random = Math.floor(Math.random() * words.length)
      let cpuWord = words[random].toString()
      let pageId = pageIds[random].toString()
      let lastLetters = await this.parseString(cpuWord, false)
      if (lastLetters[0] === "ん") {
        do {
          words.splice(words.indexOf(cpuWord), words.indexOf(cpuWord))
          random = Math.floor(Math.random() * words.length)
          cpuWord = words[random].toString()
          pageId = words[random].toString()
          lastLetters = await this.parseString(cpuWord, false)
        } while (lastLetters[0] === "ん")
      }
      this.nextWord = toUpper(lastLetters[0])
      this.say({
        text: `「${cpuWord}」`,
        dir: "left",
        url: wikiPageURL + pageId,
      })
      this.histories.push({
        word: cpuWord,
        pageId,
      })
      this.saveData()
    },
    async wikipediaSearch(query: string): Promise<String[][]> {
      const words = []
      const wikiPageId = []
      const res = await this.$axios.$get("https://ja.wikipedia.org/w/api.php", {
        params: {
          format: "json",
          action: "query",
          list: "prefixsearch",
          pssearch: query,
          pslimit: 200,
          psnamespace: 0,
          origin: "*",
        },
      })
      for (const prefixSearch of res.query.prefixsearch) {
        if (prefixSearch.title !== query) {
          const word = prefixSearch.title.replace(/ *\([^)]*\) */g, "")
          if (!this.isUsedWord(word)) {
            words.push(word)
            wikiPageId.push(prefixSearch.pageid.toString())
          }
        }
      }
      return [words, wikiPageId]
    },
    isUsedWord(str: string): boolean {
      return this.histories.some((value) => value.word === str)
    },

    /**
     * @param str 処理する文字
     * @param isFirst 最初を切り抜くかFalseなら末尾 移行：1=true -1=false
     * @return string 一文字 [ひらがな,カタカナ]
     * **/
    async parseString(str: string, isFirst: boolean) {
      const regex = /(?!\p{Lm})\p{L}|\p{N}/u

      const range = isFirst ? [0, 1] : [-1]
      // 変換の必要がなければそのままリターン
      if (/[\u3041-\u3096]/g.test(str.slice(range[0], range[1]))) {
        return [
          str.slice(range[0], range[1]),
          hiraToKana(str.slice(range[0], range[1])),
        ]
      } else if (/[\u30A1-\u30F6]/g.test(str.slice(range[0], range[1]))) {
        return [
          kanaToHira(str.slice(range[0], range[1])),
          str.slice(range[0], range[1]),
        ]
      }
      // 無効文字を削除して末尾ならAPIの必要があるかチェック
      if (range[0] === -1) {
        let word = str
        if (!regex.test(word.slice(-1))) {
          do {
            word = word.slice(0, word.length - 1)
          } while (!regex.test(word.slice(-1)))
          word = word.slice(-1)
        } else {
          word = word.slice(-1)
        }
        if (/[\u3041-\u3096]/g.test(str.slice(range[0], range[1]))) {
          return [
            str.slice(range[0], range[1]),
            hiraToKana(str.slice(range[0], range[1])),
          ]
        } else if (/[\u30A1-\u30F6]/g.test(str.slice(range[0], range[1]))) {
          return [
            kanaToHira(str.slice(range[0], range[1])),
            str.slice(range[0], range[1]),
          ]
        }
      }

      let hiraganaStr = await this.toHiragana(str)
      if (range[0] === -1) {
        if (!regex.test(hiraganaStr.slice(-1))) {
          do {
            hiraganaStr = hiraganaStr.slice(0, hiraganaStr.length - 1)
          } while (!regex.test(hiraganaStr.slice(-1)))
          hiraganaStr = hiraganaStr.slice(-1)
        } else {
          hiraganaStr = hiraganaStr.slice(-1)
        }
      }

      return [
        toUpper(hiraganaStr.slice(range[0], range[1])),
        hiraToKana(toUpper(hiraganaStr.slice(range[0], range[1]))),
      ]
    },
    say(balloonSay: BalloonSay) {
      this.balloons.push(balloonSay)
      this.$nextTick(() => {
        ;(this.$refs.messageListRef as any).scrollTop = (
          this.$refs.messageListRef as any
        ).scrollHeight
      })
    },
    saveData() {
      const data = {
        nextWord: this.nextWord,
        wordHistory: this.histories,
      }
      localStorage.setItem(dbName, JSON.stringify(data))
    },
    parseSaveData() {
      const data = JSON.parse(localStorage.getItem(dbName) ?? "")
      this.nextWord = data.nextWord
      this.histories = data.wordHistory
      this.histories.forEach((history) => {
        if (history.pageId === null) {
          this.say({
            text: `「${history.word}」`,
            dir: "right",
          })
        } else {
          this.say({
            text: `「${history.word}」`,
            dir: "left",
            url: wikiPageURL + history.pageId,
          })
        }
      })
    },
    /*
     * 文字列はすべてひらがなに・・・
     * GooラボAPIのため高コスト
     * 乱用禁止
     * */
    async toHiragana(str: string) {
      const data = await this.$axios.$post<HiraganaAPI>(
        "https://labs.goo.ne.jp/api/hiragana",
        {
          app_id: this.$config.gooLabAppId,
          sentence: str,
          output_type: "hiragana",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      return data.converted
    },
  },
})
</script>
<style>
.message-list {
  overflow-y: scroll;
  height: 60vh;
}
</style>
