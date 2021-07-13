// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint-disable no-console */
/* istanbul ignore file */

/*
to use this example, create an .env file
in the project root with the following values:

F95_USERNAME = YOUR_USERNAME
F95_PASSWORD = YOUR_PASSWORD
*/

// Public modules from npm
import inquirer from "inquirer";
import dotenv from "dotenv";

// Modules from file
import {
  login,
  UserProfile,
  getLatestUpdates,
  LatestSearchQuery,
  Game,
  searchHandiwork,
  HandiworkSearchQuery
} from "./index";

// Configure the .env reader
dotenv.config();

/**
 * Ask the user to enter the OTP code
 * necessary to authenticate on the server.
 */
async function insert2faCode(): Promise<number> {
  const questions = [
    {
      type: "input",
      name: "code",
      message: "Insert 2FA code:"
    }
  ];

  // Prompt the user to insert the code
  const answers = await inquirer.prompt(questions);
  return answers.code as number;
}

/**
 * Authenticate on the platform.
 */
async function authenticate(): Promise<boolean> {
  // Log in the platform
  console.log("Authenticating...");
  const result = await login(
    process.env.F95_USERNAME,
    process.env.F95_PASSWORD,
    insert2faCode
  );
  console.log(`Authentication result: ${result.message}\n`);

  return result.success;
}

/**
 * Fetch and show data of the current logger user.
 */
async function fetchUserData(): Promise<void> {
  console.log("Fetching user data...");

  const userdata = new UserProfile();
  await userdata.fetch();

  const watchedThreads = await userdata.watched;
  const alerts = await userdata.alerts;
  const bookmarks = await userdata.bookmarks;

  const gameThreads = watchedThreads.filter((e) => e.forum === "Games");
  const unreadGameThreads = gameThreads.filter((e) => e.unread).length;
  const unreadAlerts = alerts.filter((i) => !i.read).length;

  console.log(`User: ${userdata.name}\n`);
  console.log(`Threads followed: ${watchedThreads.length}`);
  console.log(`Games followed: ${gameThreads.length}`);
  console.log(`Unread game threads: ${unreadGameThreads}`);
  console.log(`Number of bookmarks: ${bookmarks.length}`);
  console.log(`Unread alerts: ${unreadAlerts}\n`);
}

/**
 * Fetch the data of the latest `3D game` updated.
 */
async function fetchLatestGameInfo(): Promise<void> {
  const latestQuery: LatestSearchQuery = new LatestSearchQuery();
  latestQuery.category = "games";
  latestQuery.includedTags = ["3d game"];

  const latestUpdates = await getLatestUpdates<Game>(latestQuery, 1);
  console.log(
    `"${
      latestUpdates.shift().name
    }" was the last "3d game" tagged game to be updated\n`
  );
}

/**
 * Fetch data of the games given theirs names.
 */
async function fetchGameData(games: string[]): Promise<void> {
  for (const gamename of games) {
    console.log(`Searching '${gamename}'...`);

    // Prepare the query
    const query: HandiworkSearchQuery = new HandiworkSearchQuery();
    query.category = "games";
    query.keywords = gamename;
    query.order = "likes"; // To find the most popular games

    // Fetch the first result
    const searchResult = await searchHandiwork<Game>(query, 1);

    if (searchResult.length !== 0) {
      // Extract first game
      const gamedata = searchResult.shift();
      const authors = gamedata.authors.map((a) => a.name).join(", ");
      console.log(
        `Found: ${gamedata.name} (${gamedata.version}) by ${authors}\n`
      );
    } else console.log(`No data found for '${gamename}'\n`);
  }
}

async function main() {
  if (await authenticate()) {
    // Fetch and log user data
    await fetchUserData();

    // Get latest `3D GAME` game updated
    await fetchLatestGameInfo();

    // Get game data
    const gameList = ["City of broken dreamers", "Seeds of chaos", "MIST"];
    await fetchGameData(gameList);
  } else console.log("Failed authentication, impossible to continue");
}

main();
