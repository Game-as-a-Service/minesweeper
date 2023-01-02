<script setup lang="ts">
// TypeScript enabled
import { Cell, CellState } from "@/minesweeper/cell";
import { GameState, WinLoseState } from "@/minesweeper/gameState";
import { ref } from "vue";

const socket = new WebSocket("ws://localhost:3000");

const size = ref([5, 4, 3]);
const cells = ref<Cell[][]>([]);
const gameState = ref<GameState>()

const start = function () {
  socket.send(
    JSON.stringify({
      event: "start",
      data: "",
    })
  );
};

const click = function (item: Cell) {
  console.log(`hi, ${item.x}, ${item.y}`);

  let data = {
    x: item.x,
    y: item.y,
  };

  socket.send(
    JSON.stringify({
      event: "open",
      data: JSON.stringify(data),
    })
  );
};

const flag = (item: Cell, event: MouseEvent) => {
  // console.log(event);
  // console.log(event.altKey);
  event.preventDefault();

  let data = {
    x: item.x,
    y: item.y,
  };

  socket.send(
    JSON.stringify({
      event: "flag",
      data: JSON.stringify(data),
    })
  );
}

socket.onopen = function () {
  console.log("Connected");
  // socket.send(
  //   JSON.stringify({
  //     event: 'events',
  //     data: 'test',
  //   }),
  // );

  socket.send(
    JSON.stringify({
      event: "gameInfo",
      data: "test",
    })
  );

  socket.onmessage = function (data) {
    // console.log(data);
    // console.log(data.data);
    let json = JSON.parse(data.data);
    console.log(json);
    switch (json.event) {
      case "gameInfo":
        // console.log(`cellsInfo: ${json.data}`);
        cells.value = json.data.cells;
        gameState.value = json.data.gameState;
        break;
      default:
        console.log(`unknow event: ${json.event}`);
    }
    size.value = [6, 6, 6];
  };
};
</script>

<template>
  <div class="about">
    <!-- <h1>This is an about page</h1> -->
    <!-- <div></div> -->
    <!-- <div>{{size}}</div> -->
    <!-- <div v-for="item in size">{{ item }}</div> -->
    <div class="box">
      <div v-if="gameState?.winLose === WinLoseState.WIN">You Win</div>
      <div v-if="gameState?.winLose === WinLoseState.LOSE">You Lose</div>
      <!-- <div>{{ gameState }}</div> -->
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
            <div v-if="item.state === CellState.unopened">.</div>
            <div v-else-if="item.state === CellState.flagged">!</div>
            <div v-else>
              <div v-if="item.mine">X</div>
              <div v-else>{{ item.number }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
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
    height: 30px;
    width: 30px;
  }
}
</style>
