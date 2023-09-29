<template>
  <div class="about">
    <h1>這是踩地雷遊戲</h1>
    <p>使用滑鼠左鍵點擊，踩地雷</p>
    <p>使用滑鼠右鍵點擊，建立或取消旗子</p>
    <p>在已開放的格子，使用滑鼠左鍵點擊，自動依旗子數開啟相鄰格子</p>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
<script setup lang="ts"></script>
