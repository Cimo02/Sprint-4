

function Renderer(world,ctx) {
    var poem = "Everything on the earth bristled, the bramble, pricked and the green thread, nibbled away, the petal fell, falling, until the only flower was the falling itself. Water is another matter, has no direction but its own bright grace, runs through all imaginable colors, takes limpid lessons, from stone, and in those functionings plays out, the unrealized ambitions of the foam.";
    var poemWords = poem.split(" ");
    console.log(poemWords); // just to check
    var canvas=document.getElementById("ballCanvas");
    var ctx=canvas.getContext("2d");
    const SCALE = canvas.width/10

    this.render = function() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (body = world.GetBodyList(); body; body = body.GetNext()){
            var transform = body.GetTransform();
            
            for (f = body.GetFixtureList(); f; f = f.GetNext())	{
                this.draw(f,transform);
            }
        }
        this.drawParticleSystem()
        ctx.stroke();
    }
    
    this.draw = function(fixture, transform){
        if (fixture.userData.type == "circle") return this.drawCircle(fixture.GetShape().m_radius, transform.p, fixture.color || "black")
        if (fixture.userData.type == "square") return this.drawPolygon(fixture, transform)
    }
    
    this.drawCircle = function(radius, pos, color, index = " ") {
        const newRadius = radius*SCALE;
        const x = pos.x*SCALE;
        const y = pos.y*SCALE;
        ctx.moveTo(x + newRadius, y);
        ctx.fillStyle = "#2676d1";

        if (poemWords[index] == null) return; // don't create a circle because there's no word.

        ctx.beginPath();
    
        ctx.arc(x,y, newRadius, 0,2*Math.PI);
       
        //ctx.fill();
        ctx.strokeStyle = "#2676d1";
        //ctx.stroke();
         
        // index label
        ctx.font = '16px serif';
        ctx.fillText(poemWords[index], x, y);
  
         ctx.closePath();
    }
    
    this.drawPolygon = function(fixture, transform){
    
        const pos = fixture.GetBody().GetPosition()
        ctx.beginPath();
        
        //create a line
        //cct.lineWidth = .08;
        let truePoints = []
        var shape = fixture.GetShape()
        for (var i=0;i<shape.m_count; i++){
            const point = shape.m_vertices[i]
            truePoints.push(
                {x: point.x+pos.x,
                y: point.y + pos.y } 
            )
        }
     
        ctx.moveTo(truePoints[0].x*SCALE,truePoints[0].y*SCALE);
        for(var i=1;i<truePoints.length;i++) {
            ctx.lineTo(truePoints[i].x*SCALE,truePoints[i].y*SCALE);
        }
        ctx.lineTo(truePoints[0].x*SCALE,truePoints[0].y*SCALE) // line back to initial
        ctx.closePath()
        ctx.stroke();
    }
    
    this.drawParticleSystem = function() {
        var system = world.GetParticleSystemList()
        const particles = system.GetPositionBuffer()
        const userData = system.GetUserDataBuffer()
        for (var i=0;i<system.GetParticleCount(); i++){
          let color = "black"
            if (touchingParticles.indexOf(i) > -1){
              color = "green"
              //console.log("i is touching")
            } 
            this.drawCircle(system.m_particleDiameter/2,particles[i],color,i )
            
        }
    }
}