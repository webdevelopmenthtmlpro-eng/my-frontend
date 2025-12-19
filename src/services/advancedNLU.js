export const NLU_PROVIDERS = {
  LOCAL: "local",
  GOOGLE_DIALOGFLOW: "google_dialogflow",
  MICROSOFT_LUIS: "microsoft_luis",
  IBM_WATSON: "ibm_watson",
  RASA: "rasa",
};

class AdvancedNLUService {
  constructor() {
    this.provider = NLU_PROVIDERS.LOCAL;
    this.config = {};
    this.isEnabled = false;
  }

  setProvider(provider, config = {}) {
    this.provider = provider;
    this.config = config;
    this.validateProvider();
  }

  validateProvider() {
    if (this.provider === NLU_PROVIDERS.GOOGLE_DIALOGFLOW) {
      if (!this.config.projectId || !this.config.sessionClient) {
        console.warn(
          "Google Dialogflow NLU: Missing projectId or sessionClient configuration"
        );
        this.isEnabled = false;
        return;
      }
      this.isEnabled = true;
    } else if (this.provider === NLU_PROVIDERS.MICROSOFT_LUIS) {
      if (!this.config.appId || !this.config.authoringKey) {
        console.warn(
          "Microsoft LUIS NLU: Missing appId or authoringKey configuration"
        );
        this.isEnabled = false;
        return;
      }
      this.isEnabled = true;
    } else if (this.provider === NLU_PROVIDERS.RASA) {
      if (!this.config.url) {
        console.warn("Rasa NLU: Missing URL configuration");
        this.isEnabled = false;
        return;
      }
      this.isEnabled = true;
    } else if (this.provider === NLU_PROVIDERS.LOCAL) {
      this.isEnabled = true;
    }
  }

  async detectIntentAdvanced(userMessage) {
    if (!this.isEnabled || this.provider === NLU_PROVIDERS.LOCAL) {
      return null;
    }

    switch (this.provider) {
      case NLU_PROVIDERS.GOOGLE_DIALOGFLOW:
        return this.detectIntentDialogflow(userMessage);
      case NLU_PROVIDERS.MICROSOFT_LUIS:
        return this.detectIntentLuis(userMessage);
      case NLU_PROVIDERS.RASA:
        return this.detectIntentRasa(userMessage);
      default:
        return null;
    }
  }

  async detectIntentDialogflow(userMessage) {
    try {
      const request = {
        session: this.config.sessionPath,
        queryInput: {
          text: {
            text: userMessage,
            languageCode: "en-US",
          },
        },
      };

      const responses = await this.config.sessionClient.detectIntent(request);
      const result = responses[0];
      const intent = result.queryResult.intent;
      const confidence = result.queryResult.intentDetectionConfidence;

      return {
        intent: intent.displayName,
        confidence,
        entities: result.queryResult.parameters,
        fulfillmentText: result.queryResult.fulfillmentText,
      };
    } catch (error) {
      console.error("Dialogflow NLU error:", error);
      return null;
    }
  }

  async detectIntentLuis(userMessage) {
    try {
      const url = `${this.config.endpoint}/luis/v2.0/apps/${this.config.appId}`;
      const params = new URLSearchParams({
        q: userMessage,
        verbose: true,
        staging: false,
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          "Ocp-Apim-Subscription-Key": this.config.authoringKey,
        },
      });

      const data = await response.json();
      return {
        intent: data.topScoringIntent.intent,
        confidence: data.topScoringIntent.score,
        entities: data.entities,
      };
    } catch (error) {
      console.error("Microsoft LUIS NLU error:", error);
      return null;
    }
  }

  async detectIntentRasa(userMessage) {
    try {
      const response = await fetch(`${this.config.url}/model/parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: userMessage,
        }),
      });

      const data = await response.json();
      return {
        intent: data.intent.name,
        confidence: data.intent.confidence,
        entities: data.entities,
      };
    } catch (error) {
      console.error("Rasa NLU error:", error);
      return null;
    }
  }

  getProvider() {
    return this.provider;
  }

  isProviderEnabled() {
    return this.isEnabled;
  }
}

let advancedNLU = null;

export const getAdvancedNLUService = () => {
  if (!advancedNLU) {
    advancedNLU = new AdvancedNLUService();
  }
  return advancedNLU;
};

export const initializeNLUProvider = (provider, config) => {
  const service = getAdvancedNLUService();
  service.setProvider(provider, config);
  console.log(`✅ NLU Provider initialized: ${provider}`);
};
