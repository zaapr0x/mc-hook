import { world } from "@minecraft/server";

/**
 * Manages block break events in Minecraft, allowing listeners to be registered
 * for handling block break actions and data.
 * @class
 */
function BlockBreak() {
  const listeners = [];

  /**
   * Subscribes to block break events.
   * @private
   */
  function subscribeToEvents() {
    world.afterEvents.playerBreakBlock.subscribe(handleBlockBreak);
  }

  /**
   * Handles block break events and notifies all registered listeners.
   * @private
   * @param {object} event - The block break event object.
   */
  function handleBlockBreak(event) {
    const { player, brokenBlockPermutation, block, itemStackAfterBreak } =
      event;

    const data = {
      player,
      blockId: brokenBlockPermutation.type.id,
      location: block.location,
      dimension: block.dimension,
      toolTypeId: itemStackAfterBreak ? itemStackAfterBreak.typeId : undefined,
    };

    const actions = {
      /**
       * Restores the broken block to its original state.
       */
      restore() {
        try {
          block.dimension.runCommand(
            `setblock ${data.location.x} ${data.location.y} ${data.location.z} ${data.blockId}`
          );
        } catch (error) {
          console.error(`Failed to restore block: ${error.message}`);
        }
      },
    };

    listeners.forEach((listener) => listener(data, actions));
  }

  /**
   * Registers a new listener for block break events.
   * @public
   * @param {function} callback - The callback function to handle block break events.
   * @throws {Error} If the callback is not a function.
   */
  this.listen = function (callback) {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }
    listeners.push(callback);
  };

  // Initialize event subscription
  subscribeToEvents();
}

/**
 * Singleton instance of BlockBreak.
 * @type {BlockBreak}
 */
const blockBreak = new BlockBreak();

export default blockBreak;
