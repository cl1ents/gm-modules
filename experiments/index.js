// https://github.com/AAGaming00/BetterDiscordStuff-1/blob/lmao-nice-try-discord/plugins/discordexperiments.plugin.js
// https://gist.github.com/MeguminSama/2cae24c9e4c335c661fa94e72235d4c4?permalink_comment_id=4262896#gistcomment-4262896

import * as webpackModules from '@goosemod/webpack';

const settingsStore = webpackModules.findByProps("isDeveloper");
const userStore = webpackModules.findByProps("getUsers");

export default {
    goosemodHandlers: {
        onImport: async () => {
            const nodes = Object.values(settingsStore._dispatcher._actionHandlers._dependencyGraph.nodes);
            try {
                nodes.find(x => x.name == "ExperimentStore").actionHandler["CONNECTION_OPEN"]({user: {flags: 1}, type: "CONNECTION_OPEN"})
            } catch (e) {} // this will always intentionally throw
            const oldGetUser = userStore.__proto__.getCurrentUser;
            userStore.__proto__.getCurrentUser = () => ({hasFlag: () => true})
            nodes.find(x => x.name == "DeveloperExperimentStore").actionHandler["CONNECTION_OPEN"]()
            userStore.__proto__.getCurrentUser = oldGetUser
        },

        onRemove: async () => {
            Object.values(settingsStore._dispatcher._dependencyGraph.nodes).find(x => x.name == "ExperimentStore").actionHandler["CONNECTION_OPEN"]({user: {flags: 0}, type: "CONNECTION_OPEN"}
        }
    }
}