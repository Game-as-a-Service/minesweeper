<script setup lang="ts">
  const socket = new WebSocket('ws://localhost:3000');
  socket.onopen = function() {
    console.log('Connected');
    socket.send(
      JSON.stringify({
        event: 'events',
        data: 'test',
      }),
    );
    socket.onmessage = function(data) {
      console.log(data);
    };
  };
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
