<p align="center">
  <img src="logo.png" alt="mc-hook" width="300"/>
</p>

---
An Utility Tool For Minecraft Bedrock Sripting!
---
This project contains three utility modules for Minecraft Bedrock scripting using the `@minecraft/server` and `@minecraft/server-net` APIs:

- **Block Break Event Listener**
- **Item Pickup Tracker**
- **HTTP Request Utility**

## 📁 Contents

- [Installation](#installation)
- [Usage](#usage)

  - [Block Break Events](#block-break-events)
  - [Item Pickup Events](#item-pickup-events)
  - [HTTP Requests](#http-requests)

- [License](#license)

---

## Block Break Events

**File:** `api/events/blockBreak.js`

Use this module to register callbacks when a player breaks a block.

### Example

```js
import blockBreak from "./api/events/blockBreak.js";

blockBreak.listen((data, actions) => {
  const { player, blockId, location, toolTypeId } = data;

  console.log(`${player.name} broke a ${blockId} using ${toolTypeId}`);

  // Restore the block
  actions.restore();
});
```

### Event Data

| Property     | Description                     |
| ------------ | ------------------------------- |
| `player`     | The player who broke the block  |
| `blockId`    | ID of the block broken          |
| `location`   | Location of the block           |
| `dimension`  | Dimension in which block exists |
| `toolTypeId` | Type ID of the tool used        |

### Actions

- `restore()` – Restores the block at the location.

---

## Item Pickup Events

**File:** `api/events/itemPickup.js`

Use this module to track when a player picks up items (based on inventory changes).

### Example

```js
import itemPickup from "./api/events/itemPickup.js";

itemPickup.listen((data, actions) => {
  const { player, typeId, amount } = data;

  console.log(`${player.name} picked up ${amount}x ${typeId}`);

  // Optionally remove items
  actions.remove();
}, 20); // Check every 20 ticks
```

### Parameters

- `callback` – Function called on item pickup.
- `tick` – Interval in ticks to check inventories (default: 10).

### Event Data

| Property | Description                   |
| -------- | ----------------------------- |
| `player` | Player who picked up the item |
| `typeId` | The item type ID              |
| `amount` | Number of items picked up     |

### Actions

- `remove()` – Removes the picked-up items from the inventory.

---

## 🌐 HTTP Requests

**File:** `api/lib/httpReq.js`

A wrapper for making HTTP requests using `@minecraft/server-net`.

> [!IMPORTANT]
>
> This Script Only Works On Server Side, If You Running On Client Side It will be error! [Read More](https://learn.microsoft.com/en-us/minecraft/creator/scriptapi/minecraft/server-net/minecraft-server-net?view=minecraft-bedrock-experimental)

### Example – GET

```js
import httpReq from "./api/lib/httpReq.js";

httpReq
  .get("https://api.example.com/data")
  .then((response) => {
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  })
  .catch((err) => console.error("Request failed:", err.message));
```

### Example – POST

```js
httpReq
  .post("https://api.example.com/post", { key: "value" })
  .then((res) => console.log(res.data))
  .catch((err) => console.error(err.message));
```

### Supported Methods

- `httpReq.get(url, config)`
- `httpReq.post(url, body, config)`
- `httpReq.put(url, body, config)`
- `httpReq.delete(url, config)`
- `httpReq.head(url, config)`

### Response Object

| Property  | Description                    |
| --------- | ------------------------------ |
| `status`  | HTTP status code               |
| `data`    | Parsed response body (if JSON) |
| `headers` | Response headers               |

---
