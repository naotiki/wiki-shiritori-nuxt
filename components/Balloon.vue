<template>
  <v-row dense align="center" class="message-box-l" v-if="direction==='left'">
    <v-col cols="auto" class="text-center">
      <v-icon x-large>
        mdi-account-circle-outline
      </v-icon>
      <p class="text-center">Wiki AI</p>
    </v-col>
    <v-col cols="auto" class="message-text-l">
      <slot></slot>
    </v-col>
    <v-spacer></v-spacer>
  </v-row>
  <v-row dense align="center" class="text-right message-box-r" v-else-if="direction==='right'">
    <v-spacer></v-spacer>
    <v-col cols="auto" class="message-text-r">
      <slot></slot>
    </v-col>
    <v-col cols="auto" class="text-center">
      <v-icon x-large color="blue">
        mdi-account-circle-outline
      </v-icon>
      <p class="text-center">あなた</p>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue, {PropType} from 'vue'

export default Vue.extend({
  name: "Balloon",
  props: {
    direction: {
      type: String as PropType<Dir>,
      required: true
    },
  },
  methods: {}
})
</script>

<style scoped>

.message-box-r{
  flex-wrap: nowrap;
  padding-left: 50px;
}
.message-box-l{
  flex-wrap: nowrap;
  padding-right: 50px;
}

.message-text-l {
  background: lightgray;
  border-radius: 2px 20px 20px 20px / 40px 20px 20px 20px;
  overflow-wrap: break-word;
  text-align: left;
}

.message-text-r {
  background: lightskyblue;
  border-radius: 20px 2px 20px 20px /20px 40px 20px 20px;
  overflow-wrap: break-word;
  text-align: left;
}
</style>
