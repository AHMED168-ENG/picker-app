const { Server } = require("socket.io");

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket info
  }

  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "https://api.baladiexpress.com",
          "https://baladiexpress.com",
          "https://vendor.baladiexpress.com",
          "https://qc.baladiexpress.com",
        ],
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);

      socket.on("join", (data) => {
        try {
          const { userId, role, storeId } = data;

          if (!userId) {
            socket.emit("error", { message: "userId is required" });
            return;
          }

          // حفظ معلومات المستخدم بـ userId كمفتاح
          socket.userId = userId;
          socket.role = role;
          socket.storeId = storeId;

          // الانضمام لروم باسم userId فقط
          socket.join(`user_${userId}`);

          // حفظ معلومات المستخدم في Map
          this.connectedUsers.set(userId, {
            socketId: socket.id,
            userId,
            role,
            storeId,
            joinedAt: new Date(),
          });

          console.log(`User ${userId} (${role}) connected`);
          socket.emit("joined", {
            userId,
            message: "Successfully connected",
          });
        } catch (error) {
          console.error("Error in join event:", error);
          socket.emit("error", { message: "Failed to join" });
        }
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", socket.id, "Reason:", reason);

        // البحث عن المستخدم وإزالته
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });

      socket.on("ping", () => {
        socket.emit("pong");
      });
    });

    global.socketIO = this.io;
    return this.io;
  }

  getIO() {
    if (!this.io) {
      throw new Error("Socket.io not initialized");
    }
    return this.io;
  }

  // إرسال إشعار لأي مستخدم بـ userId
  sendToUser(userId, event, data) {
    try {
      if (this.io) {
        const roomName = `user_${userId}`;
        const clients = this.io.sockets.adapter.rooms.get(roomName);

        if (clients && clients.size > 0) {
          this.io.to(roomName).emit(event, data);
          console.log(`Notification sent to user ${userId}:`, event);
          return true;
        } else {
          console.log(`User ${userId} is not connected`);
          return false;
        }
      }
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      return false;
    }
  }

  // التحقق من وجود المستخدم متصل
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  // الحصول على معلومات المستخدم المتصل
  getUserInfo(userId) {
    return this.connectedUsers.get(userId);
  }

  // إرسال لجميع المستخدمين في متجر معين
  sendToAllUsersInStore(storeId, event, data, excludeUserId = null) {
    try {
      if (this.io) {
        let sentCount = 0;

        for (const [userId, userInfo] of this.connectedUsers) {
          if (userInfo.storeId === storeId && userId !== excludeUserId) {
            this.sendToUser(userId, event, data);
            sentCount++;
          }
        }

        console.log(
          `Notification sent to ${sentCount} users in store ${storeId}`
        );
        return sentCount > 0;
      }
    } catch (error) {
      console.error(`Error sending notification to store ${storeId}:`, error);
      return false;
    }
  }

  // إرسال لجميع المستخدمين بدور معين في متجر
  sendToUsersByRoleInStore(storeId, role, event, data) {
    try {
      if (this.io) {
        let sentCount = 0;

        for (const [userId, userInfo] of this.connectedUsers) {
          if (userInfo.storeId === storeId && userInfo.role === role) {
            this.sendToUser(userId, event, data);
            sentCount++;
          }
        }

        console.log(
          `Notification sent to ${sentCount} ${role}s in store ${storeId}`
        );
        return sentCount > 0;
      }
    } catch (error) {
      console.error(
        `Error sending notification to ${role}s in store ${storeId}:`,
        error
      );
      return false;
    }
  }

  // إحصائيات المتصلين
  getConnectedUsersStats() {
    const stats = {
      total: this.connectedUsers.size,
      byRole: {},
      byStore: {},
    };

    for (const [userId, userInfo] of this.connectedUsers) {
      // إحصائيات الأدوار
      if (!stats.byRole[userInfo.role]) {
        stats.byRole[userInfo.role] = 0;
      }
      stats.byRole[userInfo.role]++;

      // إحصائيات المتاجر
      if (userInfo.storeId) {
        if (!stats.byStore[userInfo.storeId]) {
          stats.byStore[userInfo.storeId] = 0;
        }
        stats.byStore[userInfo.storeId]++;
      }
    }

    return stats;
  }
}

// إنشاء instance واحد
const socketService = new SocketService();

// تصدير الخدمة المبسطة
module.exports = {
  initSocket: (server) => socketService.init(server),
  getIO: () => socketService.getIO(),

  // الدالة الأساسية - إرسال لأي مستخدم
  sendToUser: (userId, event, data) =>
    socketService.sendToUser(userId, event, data),

  // دوال للتوافق مع الكود القديم (اختيارية)
  sendToPickerInter: (pickerId, event, data) =>
    socketService.sendToUser(pickerId, event, data),
  sendToCustomer: (customerId, event, data) =>
    socketService.sendToUser(customerId, event, data),
  sendToAdmin: (adminId, event, data) =>
    socketService.sendToUser(adminId, event, data),

  // دوال متقدمة
  sendToAllUsersInStore: (storeId, event, data, excludeUserId) =>
    socketService.sendToAllUsersInStore(storeId, event, data, excludeUserId),
  sendToUsersByRoleInStore: (storeId, role, event, data) =>
    socketService.sendToUsersByRoleInStore(storeId, role, event, data),

  // دوال مساعدة
  isUserConnected: (userId) => socketService.isUserConnected(userId),
  getUserInfo: (userId) => socketService.getUserInfo(userId),
  getStats: () => socketService.getConnectedUsersStats(),
};
