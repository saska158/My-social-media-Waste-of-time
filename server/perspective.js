const axios = require('axios')

const analyzeToxicity = async (text) => {
  try {
    const response = await axios.post(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`,
      {
        comment: { text },
        languages: ['en'],
        requestedAttributes: { TOXICITY: {} },
        doNotStore: true
      }
    )
    return response.data.attributeScores.TOXICITY.summaryScore.value
  } catch (error) {
    console.error('[perspective] API call failed, defaulting to 0.5:', error.message)
    return 0.5
  }
}

module.exports = { analyzeToxicity }
