"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const n_defensive_1 = require("@nivinjoseph/n-defensive");
const page_registration_1 = require("./page-registration");
const n_exception_1 = require("@nivinjoseph/n-exception");
const page_1 = require("./page");
const page_tree_builder_1 = require("./page-tree-builder");
class PageManager {
    constructor(vueRouter, container) {
        this._pageViewModelClasses = new Array();
        this._registrations = new Array();
        this._resolvers = new Array();
        this._vueRouterInstance = null;
        this._initialRoute = null;
        this._unknownRoute = null;
        this._defaultPageTitle = null;
        this._defaultPageMetas = null;
        this._useHistoryMode = false;
        n_defensive_1.given(vueRouter, "vueRouter").ensureHasValue();
        n_defensive_1.given(container, "container").ensureHasValue();
        this._vueRouter = vueRouter;
        this._container = container;
    }
    get useHistoryMode() { return this._useHistoryMode; }
    get vueRouterInstance() { return this._vueRouterInstance; }
    registerPages(...pageViewModelClasses) {
        this._pageViewModelClasses.push(...pageViewModelClasses);
    }
    useAsInitialRoute(route) {
        n_defensive_1.given(route, "route").ensureHasValue().ensureIsString();
        this._initialRoute = route.trim();
    }
    useAsUnknownRoute(route) {
        n_defensive_1.given(route, "route").ensureHasValue().ensureIsString();
        this._unknownRoute = route.trim();
    }
    useAsDefaultPageTitle(title) {
        n_defensive_1.given(title, "title").ensureHasValue().ensureIsString();
        this._defaultPageTitle = title.trim();
    }
    useAsDefaultPageMetadata(metas) {
        n_defensive_1.given(metas, "metas").ensureHasValue().ensureIsArray().ensure(t => t.length > 0);
        this._defaultPageMetas = [...metas];
    }
    useHistoryModeRouting() {
        this._useHistoryMode = true;
    }
    bootstrap() {
        this._pageViewModelClasses.forEach(t => this.registerPage(t));
        if (this._registrations.length === 0)
            return;
        this.createRouting();
        this.configureResolves();
    }
    registerPage(pageViewModelClass) {
        let registration = new page_registration_1.PageRegistration(pageViewModelClass, this._defaultPageTitle, this._defaultPageMetas);
        if (this._registrations.some(t => t.name === registration.name))
            throw new n_exception_1.ApplicationException(`Duplicate Page registration with name '${registration.name}'.`);
        if (this._registrations.some(t => t.route.routeKey === registration.route.routeKey))
            throw new n_exception_1.ApplicationException(`Route conflict detected for Page registration with name '${registration.name}'`);
        this._registrations.push(registration);
        this._container.registerTransient(registration.name, registration.viewModel);
        if (registration.resolvers && registration.resolvers.length > 0)
            registration.resolvers.forEach(t => {
                if (this._resolvers.contains(t.name))
                    return;
                this._container.registerTransient(t.name, t.value);
                this._resolvers.push(t.name);
            });
    }
    createRouting() {
        let pageTree = this.createPageTree();
        let vueRouterRoutes = pageTree.map(t => t.createVueRouterRoute());
        if (this._unknownRoute)
            vueRouterRoutes.push({ path: "*", redirect: this._unknownRoute });
        let vueRouter = this._vueRouter;
        const routerOptions = {
            routes: vueRouterRoutes,
            scrollBehavior: function (to, from, savedPosition) {
                return { x: 0, y: 0 };
            }
        };
        if (this._useHistoryMode)
            routerOptions.mode = "history";
        this._vueRouterInstance = new vueRouter(routerOptions);
    }
    createPageTree() {
        let root = new page_1.Page("/", null);
        let treeBuilder = new page_tree_builder_1.PageTreeBuilder(root, this._registrations);
        return treeBuilder.build();
    }
    configureResolves() {
        this._vueRouterInstance.beforeEach((to, from, next) => {
            const registrationName = to.name + "ViewModel";
            const registration = this._registrations.find(t => t.name === registrationName);
            registration.resolvedValues = null;
            if (registration.resolvers && registration.resolvers.length > 0) {
                const resolvers = registration.resolvers.map(t => this._container.resolve(t.name));
                resolvers
                    .mapAsync((t) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const resolution = yield t.resolve(from, to);
                        return resolution;
                    }
                    catch (error) {
                        return false;
                    }
                }))
                    .then(resolutions => {
                    if (resolutions.some(t => t === false)) {
                        next(false);
                        return;
                    }
                    const redirectRes = resolutions.find(t => !!t.redirect);
                    if (redirectRes && redirectRes.redirect) {
                        next(redirectRes.redirect);
                        return;
                    }
                    registration.resolvedValues = resolutions.filter(t => t.value != null).map(t => t.value);
                    next();
                })
                    .catch(() => {
                    next(false);
                });
            }
            else {
                next();
            }
        });
    }
    handleInitialRoute() {
        if (!this._initialRoute || this._initialRoute.isEmptyOrWhiteSpace())
            return;
        if (this._useHistoryMode) {
            if (!window.location.pathname || window.location.pathname.toString().isEmptyOrWhiteSpace() ||
                window.location.pathname.toString().trim() === "/" || window.location.pathname.toString().trim() === "null")
                this._vueRouterInstance.replace(this._initialRoute);
            return;
        }
        if (!window.location.hash) {
            if (this._initialRoute)
                window.location.hash = "#" + this._initialRoute;
        }
        else {
            let hashVal = window.location.hash.trim();
            if (hashVal.length === 1) {
                if (this._initialRoute)
                    window.location.hash = "#" + this._initialRoute;
            }
            else {
                hashVal = hashVal.substr(1);
                if (hashVal === "/") {
                    if (this._initialRoute)
                        window.location.hash = "#" + this._initialRoute;
                }
            }
        }
    }
}
exports.PageManager = PageManager;
//# sourceMappingURL=page-manager.js.map