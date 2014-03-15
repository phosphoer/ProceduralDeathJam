TANK.registerComponent("Game")

.construct(function()
{
  this.restarting = true;
})

.initialize(function()
{
  TANK.RenderManager.clearColor = "#000";

  this.barUI = $("<div></div>");
  this.barUI.addClass("bar");
  this.barUI.appendTo($("body"));

  this.restart = function()
  {
    this.restarting = true;
  };

  this.spawnPlayer = function()
  {
    var e = TANK.createEntity("Player");
    TANK.addEntity(e, "Player");
  };

  this.update = function(dt)
  {
    if (this.restarting)
    {
      TANK.removeComponent("World");
      TANK.addComponent("World");
      this.spawnPlayer();
      this.restarting = false;
    }
  };
});