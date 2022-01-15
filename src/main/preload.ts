import * as electron from "electron";
import * as os from "os";
import { v4 as uuidv4 } from 'uuid';
import IoFile from "./io/IoFile";

const ioFile = new IoFile();

electron.contextBridge.exposeInMainWorld("electron", {

    windowApi: {
        minimize(): void {
            electron.ipcRenderer.send("windowApi", "minimize");
        },
        maximize(): void {
            electron.ipcRenderer.send("windowApi", "maximize");
        },
        close(): void {
            electron.ipcRenderer.send("windowApi", "close");
        }
    },

    uuid: {
        getUUIDv4(): string {
            return uuidv4();
        }
    },
    
    os: {
        ram: {
            getTotal(): number {
                return Math.round(os.totalmem() / 1024 / 1024 / 1024);
            },
            getFree(): number {
                return Math.round(os.freemem() / 1024 / 1024 / 1024);
            }
        }
    },

    io: {
        save() {
            ioFile.save();
        },
        mainDisplayPosition: {
            get(): number {
                return ioFile.getDisplayPosition();
            },
            set(displayPosition: number): void {
                if(displayPosition === undefined) throw new Error("displayPosition not null.");
                ioFile.setDisplayPosition(displayPosition);
            }
        },
        java: {
            ram: {
                getMaxSize(serverName: string): number {
                    return ioFile.getRamSizeMax(serverName);
                },
                setMaxSize(serverName: string, size: number) {
                    if(size === undefined) throw new Error("size not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setRamSizeMax(serverName, size);
                },
                getMinSize(serverName: string): number {
                    return ioFile.getRamSizeMin(serverName);
                },
                setMinSize(serverName: string, size: number) {
                    if(size === undefined) throw new Error("size not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setRamSizeMin(serverName, size);
                },
                getChecked(serverName: string): boolean {
                    return ioFile.getRamChecked(serverName);
                },
                setChecked(serverName: string, checked: boolean) {
                    if(checked === undefined) throw new Error("checked not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setRamChecked(serverName, checked);
                }
            },
            parameter: {
                get(serverName: string): string {
                    return ioFile.getJavaParameter(serverName);
                },
                set(serverName: string, parameter: string) {
                    if(parameter === undefined) throw new Error("parameter not null.");
                    ioFile.setJavaParameter(serverName, parameter);
                },
                getChecked(serverName: string): boolean {
                    return ioFile.getJavaParameterChecked(serverName);
                },
                setChecked(serverName: string, checked: boolean) {
                    if(checked === undefined) throw new Error("checked not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setJavaParameterChecked(serverName, checked);
                }
            },
            path: {
                get(serverName: string): string {
                    return ioFile.getJavaPath(serverName);
                },
                set(serverName: string, path: string) {
                    if(path === undefined) throw new Error("path not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setJavaPath(serverName, path);
                },
                getChecked(serverName: string): boolean {
                    return ioFile.getJavaPathChecked(serverName);
                },
                setChecked(serverName: string, checked: boolean) {
                    if(checked === undefined) throw new Error("checked not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setJavaPathChecked(serverName, checked);
                },
                getIsBuiltInJavaVM(serverName: string): boolean {
                    return ioFile.getIsBuiltInJavaVM(serverName);
                },
                setIsBuiltInJavaVM(serverName: string, state: boolean): void {
                    if(state === undefined) throw new Error("state not null.");
                    if(serverName === undefined) throw new Error("serverName not null.");
                    ioFile.setIsBuiltInJavaVM(serverName, state);
                }
            }
        }
    }
});
