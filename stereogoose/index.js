import * as webpackModules from '@goosemod/webpack';
import { createItem, removeItem } from '@goosemod/settings';

const version = "1.0.0";
let settings = {
    enabled: true
}

let unpatchVoice
const patchVoice = () => {
    voiceModule = webpackModules.findByPrototypes("setSelfDeaf")
    initialize = voiceModule.prototype.initialize;

    unpatchVoice = () => {
        voiceModule.prototype.initialize = initialize
    }

    voiceModule.prototype.initialize = function (...args) {
      let resp = initialize.call(this, ...args);
      let setTransportOptions = this.conn.setTransportOptions;
      this.conn.setTransportOptions = function (obj) {
        console.log("Modifying...");
        if (settings.enabled) {
            if (obj.audioEncoder) {
                obj.audioEncoder.params = { stereo: "2" }
                obj.audioEncoder.channels = 2;
                obj.audioEncoder.freq = 96000;
                obj.audioEncoder.rate = 910000;
                obj.audioEncoder.pacsize = 40;
                obj.attenuation = true;
                obj.attenuateWhileSpeakingSelf = true;
                obj.attenuateWhileSpeakingOthers = false;
                obj.attenuationFactor = 200;
                obj.prioritySpeakerDucking = 0;
            }
            if (obj.encodingVoiceBitRate != 960000)
            {
                obj.encodingVoiceBitRate = 960000;
            }
            if (obj.fec) {
                obj.fec = false;
            }
            if (obj.encodingBitRate != 398000)
            {
                obj.encodingBitRate = 398000;
            }
        }
        return setTransportOptions.call(this, obj);
      };
      return resp;
    };
}

export default {
    goosemodHandlers: {
        onImport: async () => {
            patchVoice()
        },
      
        onLoadingFinished: async () => {
          createItem("Stereogoose", [
            `(v${version})`,
            {
              type: "toggle",
              text: "Stereogoose",
              subtext:
                "Enables or disables stereo (must rejoin voicechat!)",
              onToggle: (value) => settings.enabled = value,
              isToggled: () => settings.enabled,
            },
          ]);
        },
      
        remove: async () => {
          removeItem("Stereogoose");
          unpatchVoice();
        },
      
        getSettings: () => [settings],
        loadSettings: ([_settings]) => {
          settings = _settings;
        },
      
        name: "Stereogoose",
        description: "Stereocord, but for goosemod",
        author: "499802781235019777",
        version,
    }
}