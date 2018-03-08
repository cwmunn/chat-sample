export default {
  async accept (id) {
    console.log(`[${id}] accept...`)
  },
  async reject (id) {
    console.log(`[${id}] reject...`)
  },
  async leave (id) {
    console.log(`[${id}] leave...`)
  },
  async complete (id) {
    console.log(`[${id}] complete...`)
  },
  async sendMessage (id, msg) {
    console.log(`[${id}] send-message: ${msg}...`)
  },
  async typingStarted (id) {
    console.log(`[${id}] typing started...`)
  },
  async typingStopped (id) {
    console.log(`[${id}] typing stopped...`)
  }
}
