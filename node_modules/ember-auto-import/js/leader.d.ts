import type AutoImport from './auto-import';
import { AddonInstance } from '@embroider/shared-internals';
export declare class LeaderChooser {
    static for(addon: AddonInstance): LeaderChooser;
    private addonCandidates;
    private appCandidate;
    private locked;
    register(addon: AddonInstance, create: () => AutoImport): void;
    get leader(): AutoImport;
}
