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

  if (!localStorage["pdj-phosphoer-save"])
    localStorage["pdj-phosphoer-save"] = JSON.stringify({collected: 0, distance: 0});
  var save = JSON.parse(localStorage["pdj-phosphoer-save"]);

  this.recordUI = $("<div></div>");
  this.recordUI.addClass("max-indicator");
  this.recordUI.appendTo(this.barUI);
  this.recordUILabel = $("<span class='max-indicator-label'>Best - </span>");
  this.recordUILabel.appendTo(this.recordUI);
  this.recordUIValueA = $("<span class='score-indicator-value'></span>");
  this.recordUIValueA.appendTo(this.recordUI)
  this.recordUISep = $("<span class='score-sep'> / </span>");
  this.recordUISep.appendTo(this.recordUI);
  this.recordUIValueB = $("<span class='collected-indicator-value'></span>");
  this.recordUIValueB.appendTo(this.recordUI);

  this.recordUIValueA.text(save.distance + "m");
  this.recordUIValueB.text(save.collected);

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