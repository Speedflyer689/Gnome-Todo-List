/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { St, GObject } = imports.gi;


const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const checkBox = imports.ui.checkBox;

const Task = GObject.registerClass(
    class Task extends St.BoxLayout {
        _init(label) {
            super._init({
                reactive: true,
                x_expand: true
            });
            
            this.checkbox = new checkBox.CheckBox(label);
            
            this.deleteIcon = new St.Icon({
                icon_name: 'list-remove',
                style_class: 'delete-icon',
                icon_size: 24
            });

            this.deleteButton = new St.Button({ 
                style_class: 'delete-button',
            });

            this.checkbox.connect("clicked", () => {
                if(this.checkbox.checked) {
                    this.checkbox.setLabel(this.checkbox._label.get_text().split('').map(char=>char + '\u0336').join(''));
                }
                else {
                    this.checkbox.setLabel(this.checkbox._label.get_text().replace(/[\u0336]/g, ''))
                }
            });
            this.deleteButton.connect('clicked', () => {
                super.destroy();
            });
            this.deleteButton.set_child(this.deleteIcon);
            this.add(this.checkbox);
            this.add(new St.Bin({ 
                x_expand: true, 
                width: 100
            }));
            this.add(this.deleteButton);
        }
    }
);


class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        //Panel Button
        this.panelButton = new PanelMenu.Button(0.0, "TaskButton", null);
        this.icon = new St.Icon({
            icon_name: 'document-properties',
            icon_size: 24
        });

        this.panelButtonLayout = new St.BoxLayout();
        this.panelButtonLayout.add(this.icon);
        this.panelButton.add_actor(this.panelButtonLayout);

        //Todo Menu
        //Title

        this.title = new PopupMenu.PopupMenuItem("Tasks", { reactive: false, style_class: 'title'});
        this.panelButton.menu.addMenuItem(this.title);

        //Task List
        this.taskList = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            activate: true
        });
        let boxLayout = new St.BoxLayout({
            reactive: true,
            vertical: true 
        });
        this.taskList.actor.add_actor(boxLayout);
        this.panelButton.menu.addMenuItem(this.taskList);
        
        //Add Task
        
        //Input
        this.entryLabel = new St.Entry({
            name: 'Task Entry',
            primary_icon : new St.Icon({ icon_name : 'list-add', icon_size : 24 }),
            hint_text: "New task",
            can_focus : true,
            x_expand : true,
            y_expand : true
        });
        

        this.entryLabel.connect('primary-icon-clicked', ()=> {
            if (this.entryLabel.text) {
                let task = new Task(this.entryLabel.text);
                this.entryLabel.text = '';
            
                boxLayout.add_actor(task);
            }
        });

        //Add Button

        this.taskInput = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false
        });
        this.taskInput.add(this.entryLabel);
        this.panelButton.menu.addMenuItem(this.taskInput);

        Main.panel.addToStatusArea("Todo-List", this.panelButton, 0, "right");
    }
    
    disable() {
        this.panelButton?.destroy();
        this.title = null;
        this.taskList = null;
        this.entryLabel = null;
        this.taskInput = null;
        this.panelButton = null; 
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
