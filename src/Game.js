TANK.registerComponent("Game")

.construct(function()
{
  this.restarting = true;
  this.restartTimer = 0;
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
    this.restartTimer = 3;
  };

  this.spawnPlayer = function()
  {
    var e = TANK.createEntity("Player");
    TANK.addEntity(e, "Player");
  };

  this.update = function(dt)
  {
    if (this.restarting)
      this.restartTimer -= dt;

    if (this.restarting && this.restartTimer < 0)
    {
      TANK.removeComponent("World");
      TANK.addComponent("World");
      this.spawnPlayer();
      this.restarting = false;
    }
  };
});