import * as webpackModules from '@goosemod/webpack';
import { createItem, removeItem } from '@goosemod/settings';
import showToast from "@goosemod/toast";
import { version } from './goosemodModule.json';

let settings = {
    enabled: true,
    toasts: true
}

let unpatchVoice
const patchVoice = () => {
    voiceModule = webpackModules.findByPrototypes("setSelfDeaf")
    initialize = voiceModule.prototype.initialize;

    unpatchVoice = () => voiceModule.prototype.initialize = initialize

    voiceModule.prototype.initialize = function(...args) {
        let resp = initialize.call(this, ...args);
        let setTransportOptions = this.conn.setTransportOptions;
        this.conn.setTransportOptions = function(obj) {
            console.log("Modifying...");
            if (settings.enabled) {
                if (obj.audioEncoder) {
                    obj.audioEncoder.params = {
                        stereo: "2"
                    }
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

                if (obj.encodingVoiceBitRate != 960000) obj.encodingVoiceBitRate = 960000;

                if (obj.fec) obj.fec = false;

                if (obj.encodingBitRate != 398000) obj.encodingBitRate = 398000;
            }
            return setTransportOptions.call(this, obj);
        };
        return resp;
    };
}

let voiceSettings = webpackModules.findByProps("getEchoCancellation")
const verify = () =>    voiceSettings.getNoiseSuppression() ||
                        voiceSettings.getNoiseCancellation() ||
                        voiceSettings.getEchoCancellation()

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
                    subtext: "Enables or disables stereo (must rejoin voicechat!)",
                    onToggle: (value) => {
                        if (settings.toasts)
                            showToast(verify() && value ? 'Make sure to disable echo cancellation, noise reduction, and noise suppression, then rejoin the voicechat!' : 'Be sure to rejoin voicechat!')
                        settings.enabled = value
                    },
                    isToggled: () => !!settings.enabled,
                },
                {
                    type: "toggle",
                    text: "Toasts",
                    subtext: "Whether or not you wish to be notified with certain instructions...",
                    onToggle: (value) => settings.toasts = value,
                    isToggled: () => !!settings.toasts,
                },
            ]);
        },

        onRemove: async () => {
            removeItem("Stereogoose");
            unpatchVoice();
        },

        getSettings: () => [settings],
        loadSettings: ([_settings]) => {
            settings = _settings;
        }
    }
}