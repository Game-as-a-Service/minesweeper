<script setup lang="ts">
// TypeScript enabled
import { Cell, CellState } from "@/minesweeper/cell";
import { GameState, WinLoseState } from "@/minesweeper/gameState";
import { Level } from "@/minesweeper/level";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

interface Room {
  gameId: string;
  playerAccount: string;
}

const urlHost = location.host.split(":")[0];
const port = 3000;
let server = `wss://minesweeper.snowbellstudio.com:${port}`;

// for local dev
if (urlHost === "localhost" || urlHost === "127.0.0.1") {
  server = `ws://localhost:${port}`;
}

const route = useRoute();
const gameId = route.params.gameId as string;
localStorage.setItem("gameId", gameId);

const token = route.query.token as string;
if (token) {
  localStorage.setItem("waterball", token);
}
router.push(`/games/${gameId}`);

let socket: WebSocket;

const level = ref(Level.BEGINNER);
const clientCount = ref(0);
const cells = ref<Cell[][]>([]);
const gameState = ref<GameState>();
const store = useUserStore();
let reConnection = true;
const roomList = ref<Room[]>([]);

onUnmounted(() => {
  reConnection = false;
  socket.close();
});

const changeLevel = function (newLevel: Level) {
  level.value = newLevel;
  start();
};

const sendData = (event: string, data: object) => {
  socket.send(
    JSON.stringify({
      event: event,
      data: JSON.stringify({
        gameId: localStorage.getItem("gameId"),
        ...data,
      }),
    })
  );
};

const start = function () {
  let data = {
    level: level.value,
  };
  sendData("start", data);
};

const click = function (item: Cell) {
  // console.log(`hi, ${item.x}, ${item.y}`);

  let data = {
    x: item.x,
    y: item.y,
  };

  // console.log(`${item.state}`);

  if (item.state === CellState.UNOPENED) {
    sendData("open", data);
  } else if (item.state === CellState.OPENED) {
    sendData("chording", data);
  }
};

const flag = (item: Cell, event: MouseEvent) => {
  // console.log(event);
  // console.log(event.altKey);
  // console.log(event.buttons);

  event.preventDefault();

  let data = {
    x: item.x,
    y: item.y,
  };

  sendData("flag", data);
};

const joinRoom = (gameId: string) => {
  localStorage.setItem("gameId", gameId);
  sendData("gameInfo", {});
};

let interval: ReturnType<typeof setInterval> | undefined;
let isAlive = true;
let ping = ref(0);

const connect = () => {
  socket = new WebSocket(server);

  socket.onopen = function () {
    // console.log("Connected");

    clearInterval(interval);
    interval = setInterval(() => {
      if (isAlive === false) socket.close();

      isAlive = false;
      let data = {
        timestamp: Date.now(),
      };
      socket.send(JSON.stringify({ event: "ping", data }));
    }, 1000 * 1);

    const wbToken = localStorage.getItem("waterball");
    if (wbToken) {
      sendData("login_waterball", { token: wbToken });
    } else {
      sendData("login", { token: store.user.token });
    }
  };

  socket.onmessage = function (data) {
    // console.log(data);
    // console.log(data.data);
    let json = JSON.parse(data.data);
    // console.log(json);
    switch (json.event) {
      case "pong":
        isAlive = true;
        // console.log(json.data.timestamp);
        ping.value = Date.now() - json.data.timestamp;
        break;
      case "login_waterball_ack":
        // store.user.account = json.data.account;
        store.user.token = json.data.jwt;
        localStorage.setItem("token", store.user.token);
        sendData("login", { token: store.user.token });
        break;
      case "login_ack":
        if (localStorage.getItem("gameId")) {
          sendData("gameInfo", {});
        } else {
          start();
        }
        sendData("roomList", {});
        break;
      case "auth_fail":
        socket.close();
        store.logout();
        router.push({ name: "login" });
        break;
      case "roomList":
        roomList.value = json.data.roomList;
        break;
      case "gameInfo":
        // console.log(`cellsInfo: ${json.data}`);
        localStorage.setItem("gameId", json.data.gameId);
        clientCount.value = json.data.clientCount;
        cells.value = json.data.cells;
        gameState.value = json.data.gameState;
        break;
      default:
        console.log(`unknow event: ${json.event}`);
    }
  };

  socket.onclose = function () {
    clearInterval(interval);
    if (reConnection) {
      setTimeout(connect, 1000);
    }
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
    socket.close();
  };
};

connect();
</script>

<template>
  <div class="root">
    <div class="roomList">
      <div class="flex" v-for="(room, index) of roomList" :key="index">
        <div @click="joinRoom(room.gameId)">{{ room.playerAccount }}</div>
      </div>
    </div>
    <div class="box">
      <div>Hi</div>
      <div class="center">Online: {{ clientCount }}</div>
      <div class="center">Ping: {{ ping }} ms</div>
      <div v-if="gameState?.winLose === WinLoseState.WIN">You Win</div>
      <div v-if="gameState?.winLose === WinLoseState.LOSE">You Lose</div>
      <div>
        <button @click="changeLevel(Level.BEGINNER)">Beginner</button>
        <button @click="changeLevel(Level.INTERMEDIATE)">Intermediate</button>
        <button @click="changeLevel(Level.EXPERT)">Expert</button>
      </div>
      <div>Mines: {{ gameState?.displayMineCount }}</div>
      <button @click="start()">Start</button>
      <div class="box">
        <div class="flex" v-for="(row, index) in cells" :key="index">
          <div
            class="cell"
            @click="click(item)"
            @contextmenu="flag(item, $event)"
            v-for="(item, index) in row"
            :key="index"
          >
            <div v-if="item.state === CellState.UNOPENED">
              <img src="@/assets/minesweeper/unopen.png" />
            </div>
            <div v-else-if="item.state === CellState.FLAGGED">
              <img src="@/assets/minesweeper/flag.png" />
            </div>
            <div v-else>
              <img v-if="item.mine" src="@/assets/minesweeper/mine.png" />
              <img v-if="item.number === 1" src="@/assets/minesweeper/1.png" />
              <img v-if="item.number === 2" src="@/assets/minesweeper/2.png" />
              <img v-if="item.number === 3" src="@/assets/minesweeper/3.png" />
              <img v-if="item.number === 4" src="@/assets/minesweeper/4.png" />
              <img v-if="item.number === 5" src="@/assets/minesweeper/5.png" />
              <img v-if="item.number === 6" src="@/assets/minesweeper/6.png" />
              <img v-if="item.number === 7" src="@/assets/minesweeper/7.png" />
              <img v-if="item.number === 8" src="@/assets/minesweeper/8.png" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.root {
  min-height: 100vh;
  display: flex;
  align-items: center;
}
.roomList {
  margin-right: 50px;
}
.box {
  display: flex;
  flex-direction: column;
}
.flex {
  display: flex;
}
.cell {
  display: flex;
  align-content: center;
  justify-content: center;
  height: 24px;
  width: 24px;
}
.center {
  display: flex;
  align-content: center;
  justify-content: center;
}
</style>
