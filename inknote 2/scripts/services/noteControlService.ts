﻿module Inknote {

    export class NoteControlService {

        private static _instance: NoteControlService;

        static get Instance() {
            if (!NoteControlService._instance) {
                NoteControlService._instance = new NoteControlService();
            }
            return NoteControlService._instance;
        }

        piano: Drawing.Piano = new Drawing.Piano();
        private background: Drawing.NoteControlBackground = new Drawing.NoteControlBackground();
        lengthControl: Drawing.LengthControlBar = new Drawing.LengthControlBar();
        minimise: Drawing.Minimise = new Drawing.Minimise();
        restControl: Drawing.RestControl = new Drawing.RestControl();
        deleteNoteControl: Drawing.DeleteNoteControl = new Drawing.DeleteNoteControl();

        x = 0;
        y: number;
        width: number;
        height: number;

        hidden: boolean = false;

        hiddenY: number = 0;

        hide() {
            this.hidden = true;
        }

        show() {
            this.hidden = false;
        }

        ID: string = "note_control";

        getItems(drawer: DrawService): IDrawable[] {
            if (this.hidden) {
                if (this.hiddenY > drawer.canvas.height / 2) {
                    this.hiddenY = drawer.canvas.height / 2;
                }
                else if (this.hiddenY < drawer.canvas.height / 2) {
                    this.hiddenY += 10;
                }
            }
            else {
                if (this.hiddenY > 0) {
                    this.hiddenY -= 10;
                }
                else {
                    this.hiddenY = 0;
                }
            }
            this.y = drawer.canvas.height / 2 + this.hiddenY;
            this.width = Math.min(drawer.canvas.width, 800);
            this.height = drawer.canvas.height / 2;

            var noteControls = [];

            this.background.width = this.width;
            this.background.height = this.height;
            this.background.y = this.y;
            noteControls.push(this.background);

            this.restControl.y = this.y;
            this.restControl.width = this.width / 8;
            this.restControl.height = this.height / 4;
            noteControls.push(this.restControl);

            this.deleteNoteControl.y = this.y;
            this.deleteNoteControl.x = this.x + this.width * 7 / 8;
            this.deleteNoteControl.width = this.width / 8;
            this.deleteNoteControl.height = this.height / 4;
            noteControls.push(this.deleteNoteControl);

            this.lengthControl.y = this.y + this.height / 4;
            this.lengthControl.width = this.width;
            this.lengthControl.height = this.height / 4;
            noteControls.push(this.lengthControl);

            this.piano.width = this.width;
            this.piano.height = this.height / 2;
            this.piano.y = this.y + this.height / 2;
            noteControls.push(this.piano);

            this.minimise.width = 40;
            this.minimise.height = 20;
            this.minimise.x = this.x;
            this.minimise.y = this.y - this.minimise.height;
            noteControls.push(this.minimise);


            return noteControls;
        }

        addInstrument(name: string): void {
            var project = Managers.ProjectManager.Instance.currentProject;

            var barsCount = project.instruments[0].bars.length;

            var newInstrument = new Model.Instrument(name);

            for (var i = 0; i < barsCount; i++) {
                newInstrument.bars.push(new Model.Bar());
            }

            project.instruments.push(newInstrument);

            ScoringService.Instance.refresh();
        }

        addBar(): void {
            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {

                project.instruments[i].bars.push(new Model.Bar());

            }

        }

        addNote(note: Model.Note): void {
            var project = Managers.ProjectManager.Instance.currentProject;

            var instrument = project.instruments[0];

            if (instrument.bars.length == 0) { 
                this.addBar();
                instrument.bars[instrument.bars.length - 1].items.push(new Model.TrebleClef());
            }

            var bar = instrument.bars[instrument.bars.length - 1];

            if (bar.items.length > 3) {
                this.addBar();
                bar = instrument.bars[instrument.bars.length - 1];
            }

            bar.items.push(note);

            ScoringService.Instance.refresh();
        }

        addRest(): void {
            var project = Managers.ProjectManager.Instance.currentProject;

            var instrument = project.instruments[0];

            if (instrument.bars.length == 0) {
                this.addBar();
                instrument.bars[instrument.bars.length - 1].items.push(new Model.TrebleClef());
            }

            var bar = instrument.bars[instrument.bars.length - 1];

            if (bar.items.length > 3) {
                this.addBar();
                bar = instrument.bars[instrument.bars.length - 1];
            }

            var rest = new Model.Rest(this.lengthControl.selectedLength);

            bar.items.push(rest);

            ScoringService.Instance.refresh();
        }

        editNoteLength() {
            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {
                for (var j = 0; j < project.instruments[i].bars.length; j++) {
                    var bar = project.instruments[i].bars[j];

                    for (var k = 0; k < bar.items.length; k++) {
                        var item = bar.items[k];
                        if (item.ID == ScoringService.Instance.selectID) {
                            if (item instanceof Model.Note) {
                                item.length = this.lengthControl.selectedLength;
                            }
                            else if (item instanceof Model.Rest) {
                                item.length = this.lengthControl.selectedLength;
                            }
                            else if (item instanceof Model.Chord) {
                                for (var l = 0; l < item.notes.length; l++) {
                                    item.notes[l].length = this.lengthControl.selectedLength;
                                }
                            }
                        }
                    }
                }
            }

            ScoringService.Instance.refresh();
        }

        editCurrentClef(goUp: boolean) {
            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {
                for (var j = 0; j < project.instruments[i].bars.length; j++) {
                    var bar = project.instruments[i].bars[j];

                    for (var k = 0; k < bar.items.length; k++) {
                        var item = bar.items[k];
                        
                        if (item.ID == ScoringService.Instance.selectID) {
                            if (item instanceof Model.Clef) {
                                bar.items[k] = getNextClef(<Model.Clef>item, goUp);
                            }
                        }
                    }
                }
            }

            ScoringService.Instance.refresh();
        }

        deleteSelected() {
            if (ScoringService.Instance.SelectedItem instanceof Drawing.Note) {
                NoteControlService.Instance.deleteItem();
            }
            else if (ScoringService.Instance.SelectedItem instanceof Drawing.Bar) {
                BarService.Instance.deleteSelectedBar();
            }
        }

        deleteItem() {
            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {

                var previousItem: Model.Rest | Model.Note | Model.Chord | Model.Clef = null;

                for (var j = 0; j < project.instruments[i].bars.length; j++) {
                    var bar = project.instruments[i].bars[j];

                    var newItems = [];

                    for (var k = 0; k < bar.items.length; k++) {
                        var item = bar.items[k];
                        if (item.ID == ScoringService.Instance.selectID) {
                            // have it......... dealt with
                            if (previousItem) {
                                ScoringService.Instance.selectID = previousItem.ID;
                            }
                            else {
                                ScoringService.Instance.selectID = null;
                            }
                        }
                        else {
                            newItems.push(item);
                        }

                        previousItem = item;
                    }

                    bar.items = newItems;
                }
            }

            ScoringService.Instance.refresh();
        }

        editNoteValueAndOctave(value: Model.NoteValue, octave: number) {

            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {
                for (var j = 0; j < project.instruments[i].bars.length; j++) {
                    var bar = project.instruments[i].bars[j];

                    for (var k = 0; k < bar.items.length; k++) {
                        var item = bar.items[k];
                        if (item.ID == ScoringService.Instance.selectID) {
                            if (item instanceof Model.Note) {
                                item.value = value;
                                item.octave = octave;
                                item.length = this.lengthControl.selectedLength;
                            }
                            else if (item instanceof Model.Rest) {

                            }
                            else if (item instanceof Model.Chord) {

                            }
                        }
                    }
                }
            }

            ScoringService.Instance.refresh();
        }

        noteValueUp() {

            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {
                for (var j = 0; j < project.instruments[i].bars.length; j++) {
                    var bar = project.instruments[i].bars[j];

                    for (var k = 0; k < bar.items.length; k++) {
                        var item = bar.items[k];
                        if (item.ID == ScoringService.Instance.selectID) {
                            if (item instanceof Model.Note) {
                                var newVal = item.value + 1;
                                item.value = newVal % 12;
                                item.octave = newVal % 12 == Model.NoteValue.C ? item.octave + 1 : item.octave;
                            }
                            else if (item instanceof Model.Rest) {

                            }
                            else if (item instanceof Model.Chord) {

                            }
                        }
                    }
                }
            }

            ScoringService.Instance.refresh();

        }

        noteValueDown() {

            var project = Managers.ProjectManager.Instance.currentProject;

            for (var i = 0; i < project.instruments.length; i++) {
                for (var j = 0; j < project.instruments[i].bars.length; j++) {
                    var bar = project.instruments[i].bars[j];

                    for (var k = 0; k < bar.items.length; k++) {
                        var item = bar.items[k];
                        if (item.ID == ScoringService.Instance.selectID) {
                            if (item instanceof Model.Note) {
                                var newVal = item.value + 11;
                                item.value = newVal % 12;
                                item.octave = newVal % 12 == Model.NoteValue.B ? item.octave - 1 : item.octave;
                            }
                            else if (item instanceof Model.Rest) {

                            }
                            else if (item instanceof Model.Chord) {

                            }
                        }
                    }
                }
            }

            ScoringService.Instance.refresh();

        }

        constructor() {
            this.piano.ID = this.ID;
            this.background.ID = this.ID;
            this.lengthControl.ID = this.ID;
            this.minimise.ID = this.ID;
        }
    }

} 