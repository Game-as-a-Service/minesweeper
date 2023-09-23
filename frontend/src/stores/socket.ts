import { reactive } from "vue";
import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { sokcetioUrl } from "@/common/config";

interface ISocket {
  socket: Socket | null;
  connectHandler: any;
  listenerMap: Map<string, any[]>;
  pingInterval: ReturnType<typeof setInterval> | undefined;
}

interface IState {
  connected: boolean;
  ping: number;
}

export const useSocketStore = defineStore("socket", () => {
  const instance = reactive<ISocket>({
    socket: null,
    connectHandler: () => {},
    listenerMap: new Map<string, any[]>(),
    pingInterval: undefined,
  });

  const state = reactive<IState>({
    connected: false,
    ping: 0,
  });

  function setConnectHandler(handler: any) {
    instance.connectHandler = handler;
  }

  function addEventListener(event: string, listener: any) {
    let listenerList = instance.listenerMap.get(event);
    if (!listenerList) {
      instance.listenerMap.set(event, []);
      listenerList = instance.listenerMap.get(event);
    }

    listenerList?.push(listener);
  }

  function connect() {
    instance.socket = io(sokcetioUrl);

    instance.socket.on("connect", function () {
      state.connected = true;

      clearInterval(instance.pingInterval);
      instance.pingInterval = setInterval(() => {
        const data = {
          timestamp: Date.now(),
        };
        instance.socket?.emit("ping", data);
      }, 1000 * 1);

      instance.connectHandler();
    });

    instance.socket.on("disconnect", function () {
      state.connected = false;
    });

    instance.socket.on("pong", (data) => {
      state.ping = Date.now() - data.timestamp;
    });

    instance.socket.onAny((event, data) => {
      const listenerList = instance.listenerMap.get(event);
      listenerList?.forEach((listener) => {
        listener(data);
      });
    });
  }

  function sendEvent(event: string, data: any) {
    instance.socket?.emit(event, data);
  }

  return { state, setConnectHandler, addEventListener, connect, sendEvent };
});
