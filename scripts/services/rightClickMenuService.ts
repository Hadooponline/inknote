﻿module Inknote {

    export class RightClickMenuService {

        private static _instance: RightClickMenuService;

        static get Instance(): RightClickMenuService {
            if (!RightClickMenuService._instance) {
                RightClickMenuService._instance = new RightClickMenuService();
            }

            return RightClickMenuService._instance;
        }

        visible: boolean;
        private _menu: Drawing.RightClickMenus.RightClickMenu;

        get Menu(): Drawing.RightClickMenus.RightClickMenu {

            if (!this._menu) {
                this._menu = new Drawing.RightClickMenus.RightClickMenu();
            }

            return this._menu;
        }

        openMenu(x: number, y: number, canvas: HTMLCanvasElement) {

            var newMenu = new Drawing.RightClickMenus.RightClickMenu();

            if (Managers.PageManager.Current.page == Managers.Page.File && anyItemIs(Managers.ProjectManager.Instance.allProjects, function (item: Project) { return item.ID == Managers.ProjectManager.Instance.hoverID; })){ 
                newMenu = new Drawing.RightClickMenus.RightClickFile(Managers.ProjectManager.Instance.hoverID);
                Managers.ProjectManager.Instance.selectID = Managers.ProjectManager.Instance.hoverID;
            }
            if (Managers.PageManager.Current.page == Managers.Page.Score) {
                newMenu = new Drawing.RightClickMenus.RightClickScore();
            }

            var tooFarRight = canvas.width > (x + newMenu.width);
            newMenu.x = tooFarRight ? x : x - newMenu.width;
            newMenu.y = canvas.height > (y + newMenu.height) ? y : y - newMenu.height;
            this._menu = newMenu;
            this.visible = true;

        }

        constructor() {

        }
    } 

}