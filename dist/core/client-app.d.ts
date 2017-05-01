import "n-ext";
import { ComponentInstaller } from "n-ject";
export declare class ClientApp {
    private readonly _appElementId;
    private readonly _container;
    private readonly _componentManager;
    private readonly _pageManager;
    private _initialRoute;
    private _app;
    private _accentColor;
    private _isbootstrapped;
    constructor(appElementId: string);
    useInstaller(installer: ComponentInstaller): this;
    useAccentColor(color: string): this;
    registerComponents(...componentViewModelClasses: Function[]): this;
    registerPages(...pageViewModelClasses: Function[]): this;
    useAsInitialRoute(route: string): this;
    useAsUnknownRoute(route: string): this;
    enableDevMode(): this;
    bootstrap(): void;
    private configureComponents();
    private configurePages();
    private configureInitialRoute();
    private configureCoreServices();
    private configureContainer();
    private configureRoot();
}
