import { world, system } from "@minecraft/server";

/**
 * Manages item pickup events in Minecraft, tracking inventory changes and notifying listeners.
 * @class
 */
function ItemPickup() {
  const DEFAULT_TICK = 10;
  const listeners = []; // Array of { callback, tick, counter }
  const playerCache = new Map(); // Cache of player inventory snapshots
  let systemIntervalId = null;
  let systemIntervalTick = DEFAULT_TICK;

  /**
   * Starts the system interval to check for item pickups.
   * @private
   */
  function startSystemInterval() {
    if (systemIntervalId !== null) return;

    systemIntervalId = system.runInterval(() => {
      const players = world.getPlayers();

      listeners.forEach((listener) => {
        listener.counter += systemIntervalTick;
      });

      for (const player of players) {
        if (!player.hasComponent("minecraft:inventory")) continue;

        const inventory = player.getComponent("minecraft:inventory").container;
        const current = snapshotInventory(inventory);
        const previous = playerCache.get(player.name) || new Map();

        for (const [typeId, amount] of current) {
          const oldAmount = previous.get(typeId) || 0;
          if (amount <= oldAmount) continue;

          const pickedUpAmount = amount - oldAmount;
          const data = {
            typeId,
            amount: pickedUpAmount,
            player,
          };
          const actions = {
            /**
             * Removes the picked-up items from the player's inventory.
             */
            remove() {
              try {
                removeItemsFromInventory(typeId, pickedUpAmount, inventory);
              } catch (error) {
                console.error(`Failed to remove items: ${error.message}`);
              }
            },
          };

          listeners.forEach((listener) => {
            if (listener.counter >= listener.tick) {
              listener.callback(data, actions);
              listener.counter = 0;
            }
          });
        }

        playerCache.set(player.name, current);
      }
    }, systemIntervalTick);
  }

  /**
   * Adjusts the system interval based on the minimum tick value of all listeners.
   * @private
   */
  function adjustSystemInterval() {
    const minTick = listeners.reduce(
      (min, listener) => Math.min(listener.tick, min),
      DEFAULT_TICK
    );

    if (minTick !== systemIntervalTick) {
      systemIntervalTick = minTick;
      if (systemIntervalId !== null) {
        system.clearRun(systemIntervalId);
        systemIntervalId = null;
        startSystemInterval();
      }
    }
  }

  /**
   * Creates a snapshot of the player's inventory.
   * @private
   * @param {object} inventory - The player's inventory container.
   * @returns {Map<string, number>} A map of item type IDs to their total amounts.
   */
  function snapshotInventory(inventory) {
    const result = new Map();
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (item) {
        result.set(item.typeId, (result.get(item.typeId) || 0) + item.amount);
      }
    }
    return result;
  }

  /**
   * Removes a specified amount of items from the inventory.
   * @private
   * @param {string} typeId - The item type ID to remove.
   * @param {number} amountToRemove - The amount to remove.
   * @param {object} inventory - The player's inventory container.
   */
  function removeItemsFromInventory(typeId, amountToRemove, inventory) {
    let remaining = amountToRemove;
    for (let i = 0; i < inventory.size && remaining > 0; i++) {
      const item = inventory.getItem(i);
      if (item && item.typeId === typeId) {
        if (item.amount <= remaining) {
          inventory.setItem(i, null);
          remaining -= item.amount;
        } else {
          item.amount -= remaining;
          inventory.setItem(i, item);
          remaining = 0;
        }
      }
    }
  }

  /**
   * Registers a listener for item pickup events.
   * @public
   * @param {function} callback - The callback to handle item pickup events, receiving data and actions objects.
   * @param {number} [tick=10] - The tick interval for the callback.
   * @throws {Error} If the callback is not a function or tick is invalid.
   */
  this.listen = function (callback, tick = DEFAULT_TICK) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    if (!Number.isInteger(tick) || tick < 1) {
      throw new Error("Tick must be a positive integer");
    }
    listeners.push({ callback, tick, counter: 0 });
    adjustSystemInterval();
    startSystemInterval();
  };
}

/**
 * Singleton instance of ItemPickup.
 * @type {ItemPickup}
 */
const itemPickup = new ItemPickup();

export default itemPickup;
