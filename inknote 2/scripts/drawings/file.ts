﻿module Inknote {

    export class File implements IDrawable {

        ID = getID();
        x: number;
        y: number;
        order = 10;
        hover = false;
        select = false;

        isOver(x: number, y: number) {
            if (x < this.x + 50 && x > this.x - 50) {
                //console.log(this.x + ":" + this.y);
                //console.log("Mouse: " + x + ":" + y);

                return (y < this.y + 80 && y > this.y - 50);

            }

            return false;
        }

        draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scale: number) => boolean;

        constructor(public name: string) {
            var self = this;

            self.draw = function(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scale: number): boolean {

                if (self.hover || self.select) {
                    ctx.fillStyle = "rgb(190,220,240)";
                    ctx.beginPath();
                    ctx.rect(self.x - 60, self.y - 60, 120, 140);
                    ctx.fill();
                }

                var grd = ctx.createLinearGradient(self.x - 50, self.y - 50, self.x + 50, self.y + 50);
                
                var fold = 20;
                if (self.select) {
                    grd.addColorStop(0, "rgb(240, 162, 86)");
                    fold = 0;
                }
                else {
                    grd.addColorStop(0, "rgb(220, 142, 66)");
                }

                grd.addColorStop(1, "rgb(250, 222, 196)");

                ctx.fillStyle = grd;

                ctx.beginPath();
                ctx.moveTo(self.x - 50, self.y + 50);
                ctx.lineTo(self.x + 50, self.y + 50);
                ctx.lineTo(self.x + 50, self.y - 50);
                ctx.lineTo(self.x - fold, self.y - 50);
                ctx.lineTo(self.x - 50, self.y - fold);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(self.x - (fold + 4), self.y - 45);
                ctx.lineTo(self.x - 45, self.y - 45);
                ctx.lineTo(self.x - 45, self.y - (fold + 4));
                ctx.strokeStyle = "black";
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.stroke();

                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.fillText(self.name, self.x, self.y + 70);

                if (self.hover) {
                    ctx.strokeStyle = "rgb(100,130,240)";
                    ctx.beginPath();
                    ctx.rect(self.x - 60, self.y - 60, 120, 140);
                    ctx.stroke();
                }

                return true;
            }

        }

    }

}