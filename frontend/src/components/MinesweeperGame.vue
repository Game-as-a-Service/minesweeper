<script setup lang="ts">
// TypeScript enabled
import { Cell, CellState } from "@/minesweeper/cell";
import { GameState, WinLoseState } from "@/minesweeper/gameState";
import { Level } from "@/minesweeper/level";
import router from "@/router";
import { useSocketStore } from "@/stores/socket";
import { useUserStore } from "@/stores/user";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

interface Room {
  gameId: string;
  playerAccount: string;
}

const route = useRoute();
const userStore = useUserStore();
const socketStore = useSocketStore();

const gameId = route.params.gameId as string;

const token = route.query.token as string;
if (token) {
  localStorage.setItem("waterball", token);
}

if (gameId) {
  localStorage.setItem("gameId", gameId);
  router.push(`/games/${gameId}`);
}

let wbToken: string | null = null;

const level = ref(Level.BEGINNER);
const clientCount = ref(0);
const cells = ref<Cell[][]>([]);
const gameState = ref<GameState>();
const roomList = ref<Room[]>([]);
const nickName = ref("");

onMounted(() => {
  socketStore.addEventListener("login_waterball_ack", (data: any) => {
    userStore.user.token = data.jwt;
    nickName.value = data.nickname;
    localStorage.setItem("token", userStore.user.token);
    sendData("login", { token: userStore.user.token });
  });

  socketStore.addEventListener("login_ack", (data: any) => {
    if (nickName.value === "") {
      nickName.value = userStore.user.account;
    }
    if (localStorage.getItem("gameId")) {
      sendData("gameInfo", {});
    } else {
      start();
    }
    sendData("roomList", {});
  });
  socketStore.addEventListener("auth_fail", (data: any) => {
    console.log("auth_fail");
    userStore.logout();
    if (!wbToken) {
      router.push({ name: "login" });
    }
  });

  socketStore.addEventListener("roomList", (data: any) => {
    roomList.value = data.roomList;
  });

  socketStore.addEventListener("gameInfo", (data: any) => {
    localStorage.setItem("gameId", data.gameId);
    clientCount.value = data.clientCount;
    cells.value = data.cells;
    gameState.value = data.gameState;
  });

  socketStore.setConnectHandler(() => {
    login();
  });

  login();
});

function login() {
  wbToken = localStorage.getItem("waterball");
  if (wbToken) {
    sendData("login_waterball", { token: wbToken });
  } else {
    sendData("login", { token: userStore.user.token });
  }
}

const changeLevel = function (newLevel: Level) {
  level.value = newLevel;
  start();
};

const sendData = (event: string, data: object) => {
  socketStore.sendEvent(event, {
    gameId: localStorage.getItem("gameId"),
    ...data,
  });
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
</script>

<template>
  <div class="flex justify-center">
    <div>
      <div>Hi: {{ nickName }}</div>
      <div>Online: {{ clientCount }}</div>
      <h1>線上玩家</h1>
      <div class="flex" v-for="(room, index) of roomList" :key="index">
        <div class="btn btn-blue" @click="joinRoom(room.gameId)">
          {{ room.playerAccount }}
        </div>
      </div>
    </div>
    <div class="flex flex-col ml-5">

      <div v-if="gameState?.winLose === WinLoseState.WIN">You Win</div>
      <div v-if="gameState?.winLose === WinLoseState.LOSE">You Lose</div>
      <!--      <div>-->
      <!--        <button class="btn btn-blue" @click="changeLevel(Level.BEGINNER)">Beginner</button>-->
      <!--        <button class="btn btn-blue" @click="changeLevel(Level.INTERMEDIATE)">Intermediate</button>-->
      <!--        <button class="btn btn-blue" @click="changeLevel(Level.EXPERT)">Expert</button>-->
      <!--      </div>-->
      <div>Mines: {{ gameState?.displayMineCount }}</div>
      <button class="btn btn-blue" @click="start()">Start</button>
      <div class="flex flex-col">
        <div class="flex" v-for="(row, index) in cells" :key="index">
          <div
            class="h-[24px] w-[24px]"
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
              <div v-if="item.number === 0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
