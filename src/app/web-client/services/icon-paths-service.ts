export class IconPathsService {

    constructor(){
        this.init();
    }
    iconPaths: IconPaths = {};

    private init() {

        let paths = [
            { key: 'answerImg', path: 'assets/img/cc4s/Answer_call.png' },
            { key: 'ignoreImg', path: 'assets/img/cc4s/Ignore_call.png' },
            { key: 'startRecordImg', path: 'assets/img/cc4s/Mute1.png' },
            { key: 'stopRecordImg', path: 'assets/img/cc4s/Recording.gif' },
            { key: 'holdImg', path: 'assets/img/cc4s/Hold1.png' },
            { key: 'resumeImg', path: 'assets/img/cc4s/Hold2.png' },
            { key: 'parkImg', path: 'assets/img/cc4s/Park.png' },
            { key: 'disconnectImg', path: 'assets/img/cc4s/Disconnect.png' },
            { key: 'switchToCallerImg', path: 'assets/img/cc4s/SwitchSides1.png' },
            { key: 'switchToAgentImg', path: 'assets/img/cc4s/SwitchSides2.png' },
            { key: 'warmTransferCommitImg', path: 'assets/img/cc4s/Warm_transfer.png' },
            { key: 'warmTransferStartImg', path: 'assets/img/cc4s/Warm_transfer.png' },
            { key: 'silentMonitorImg', path: 'assets/img/cc4s/Monitor.png' },
            { key: 'whisperImg', path: 'assets/img/cc4s/Whisper.png' },
            { key: 'bargeInImg', path: 'assets/img/cc4s/BargeIn.png' },
            { key: 'dialpadImg', path: 'assets/img/cc4s/Dialpad.png' },
            { key: 'dialImg', path: 'assets/img/cc4s/Telephony_on.png' },
            { key: 'logoutImg', path: 'assets/img/cc4s/log-out-icon-5.jpg' }                        

        ];

        this.addIconPaths(paths);

    }

    private addIconPaths(iconPaths: { key: string, path: string }[]) {
        iconPaths.forEach(p => { this.addIconPath(p.key, p.path) });
    }
    private addIconPath(key: string, path: string) {

        this.iconPaths[key] = path;
    }
}

export class IconPaths {
    [key: string]: string
}