





## v13.0.3 (2022-05-11)

#### :bug: Bug Fix
* [#386](https://github.com/lint-todo/utils/pull/386) Fixes erroneous blank lines in .lint-todo storage file ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v13.0.2 (2022-04-15)

#### :bug: Bug Fix
* [#379](https://github.com/lint-todo/utils/pull/379) Fix compacting to not be destructive with other engines ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v13.0.1 (2022-04-15)

#### :bug: Bug Fix
* [#378](https://github.com/lint-todo/utils/pull/378) Downgrading find-up as it collides with other projects using ESM ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v13.0.0 (2022-04-14)

#### :boom: Breaking Change
* [#376](https://github.com/lint-todo/utils/pull/376) Fix incorrect logic for todo storage file compacting. ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement
* [#372](https://github.com/lint-todo/utils/pull/372) Update config finding logic to traverse upwards to find config ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix
* [#376](https://github.com/lint-todo/utils/pull/376) Fix incorrect logic for todo storage file compacting. ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#377](https://github.com/lint-todo/utils/pull/377) Rename testing directories ([@scalvert](https://github.com/scalvert))
* [#336](https://github.com/lint-todo/utils/pull/336) Converting jest to vitest ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v12.0.1 (2021-12-28)

#### :bug: Bug Fix
* [#325](https://github.com/lint-todo/utils/pull/325) Fixes todos not correctly matching up when using non-normalized relative paths ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#326](https://github.com/lint-todo/utils/pull/326) Upgrading jest and associated dependencies and adding snapshotFormat ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v12.0.0 (2021-12-14)

#### :boom: Breaking Change
* [#318](https://github.com/lint-todo/utils/pull/318) Add read options when reading from todo storage file ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement
* [#321](https://github.com/lint-todo/utils/pull/321) Adding new API: generateTodoBatches ([@scalvert](https://github.com/scalvert))

#### :house: Internal
* [#322](https://github.com/lint-todo/utils/pull/322) Adding auto merge for dependabot ([@scalvert](https://github.com/scalvert))

#### Committers: 1
- Steve Calvert ([@scalvert](https://github.com/scalvert))


## v11.0.0 (2021-12-03)


## v11.0.0 (2021-12-03)

#### :boom: Breaking Change

- [#301](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/301) Implements single file todos described in #298 ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement

- [#303](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/303) chore: Add locking on reads for storage file ([@scalvert](https://github.com/scalvert))

### :house: Internal

- [#294](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/294) Adding readme-api-generator over custom script ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation

- [#304](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/304) Fixing jsdoc for new APIs ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v10.0.0 (2021-08-15)

#### :boom: Breaking Change

- [#279](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/279) Change return value of writeTodos to object ([@scalvert](https://github.com/scalvert))
- [#276](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/276) Change public API to take V2 format data over lint results ([@scalvert](https://github.com/scalvert))
- [#264](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/264) Adding test cases for fuzzy matching ([@scalvert](https://github.com/scalvert))
- [#252](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/252) Adding expanded todo batching functionality to account for fuzzy matching ([@scalvert](https://github.com/scalvert))
- [#250](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/250) Renaming FilePath type to improve code readability ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement

- [#277](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/277) Adds match agnostic lint result identity referencing ([@scalvert](https://github.com/scalvert))
- [#270](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/270) Adds new readTodoData API for convenience reading of TodoDataV2 ([@scalvert](https://github.com/scalvert))
- [#264](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/264) Adding test cases for fuzzy matching ([@scalvert](https://github.com/scalvert))
- [#257](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/257) Expands todo data into v2 format ([@scalvert](https://github.com/scalvert))
- [#252](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/252) Adding expanded todo batching functionality to account for fuzzy matching ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#269](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/269) Converts the remove Set back to a Map, which is required for consumers ([@scalvert](https://github.com/scalvert))
- [#268](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/268) Adds missing export to public API ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#250](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/250) Renaming FilePath type to improve code readability ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v9.1.2 (2021-06-10)

## v9.1.1 (2021-06-10)

#### :bug: Bug Fix

- [#247](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/247) Exporting new date-utils APIs ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v9.1.0 (2021-06-10)

#### :rocket: Enhancement

- [#242](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/242) Adds new validateConfig function ([@scalvert](https://github.com/scalvert))
- [#238](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/238) Adds new date utils: differenceInDays and format ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v9.0.1 (2021-06-10)

#### :bug: Bug Fix

- [#237](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/237) Tweak `getDatePart` to use UTC date ([@rwjblue](https://github.com/rwjblue))

#### Committers: 2

- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@dependabot-preview[bot]](https://github.com/apps/dependabot-preview)

## v9.0.0 (2021-06-08)

#### :boom: Breaking Change

- [#213](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/213) Extends todo configuration to support configuring days to decay by rule ID. ([@scalvert](https://github.com/scalvert))
- [#212](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/212) Removes unsued APIs for write/ensure todo config ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation

- [#225](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/225) Update docs with new getTodoConfig API changes ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v8.1.0 (2021-05-04)

#### :rocket: Enhancement

- [#185](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/185) Adding expired batch to getTodoBatches ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v8.0.0 (2021-03-09)

## v8.0.0 (2021-03-09)

#### :boom: Breaking Change

- [#81](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/81) Changing property in WriteTodoOptions to more versatile version ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement

- [#88](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/88) Returning defaults for todoConfig when none exist ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#87](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/87) Fixes typo when writing todoConfig ([@scalvert](https://github.com/scalvert))
- [#84](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/84) Fixes correctly exporting ensureTodoConfig ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#90](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/90) Adding test to ensure engine scoped removal works using shouldRemove ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v7.0.0 (2021-01-27)

#### :boom: Breaking Change

- [#80](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/80) Changed signature of writeTodos to allow additional param for skipping removal ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement

- [#80](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/80) Changed signature of writeTodos to allow additional param for skipping removal ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v6.1.0 (2021-01-26)

#### :rocket: Enhancement

- [#76](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/76) Adding ensureTodoConfig to write default config ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#72](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/72) Fixing @link references for README ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation

- [#72](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/72) Fixing @link references for README ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v6.0.1 (2021-01-15)

#### :bug: Bug Fix

- [#67](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/67) Adds tslib (needed when using importHelpers) ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#65](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/65) Standardize casing for todos ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v6.0.0 (2021-01-12)

#### :boom: Breaking Change

- [#48](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/48) Changes return value of writeTodos[Sync] to return added and removed todo counts ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement

- [#45](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/45) Adding writeTodoConfig util ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#47](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/47) Ensures empty todo directories are deleted ([@scalvert](https://github.com/scalvert))
- [#46](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/46) Fixing error message for invalid config values ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v5.0.0 (2021-01-08)

#### :boom: Breaking Change

- [#44](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/44) Adds new util `getSeverity` ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v4.1.0 (2021-01-06)

#### :rocket: Enhancement

- [#43](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/43) Adding todo config util ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#42](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/42) Moves @types/eslint to deps from devDeps ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v4.0.0 (2020-12-31)

#### :boom: Breaking Change

- [#39](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/39) Adding JSON date reviver to deserialize dates ([@scalvert](https://github.com/scalvert))

#### :rocket: Enhancement

- [#40](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/40) Adding overloads for writeTodos[Sync] ([@scalvert](https://github.com/scalvert))
- [#38](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/38) Adds ability to set due dates created dates for testing ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#41](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/41) Changes the way consumers can provide createdDate ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v3.3.0 (2020-12-23)

#### :rocket: Enhancement

- [#37](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/37) Adding sync APIs and tests ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v3.2.0 (2020-12-22)

#### :rocket: Enhancement

- [#34](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/34) Auto-generating API docs ([@scalvert](https://github.com/scalvert))
- [#33](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/33) Implements todo-due-dates spec ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation

- [#36](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/36) Adding eslint-plugin-tsdoc and regenerating docs ([@scalvert](https://github.com/scalvert))
- [#34](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/34) Auto-generating API docs ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#35](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/35) Updating test fixtures to not suck ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v3.1.0 (2020-12-17)

#### :rocket: Enhancement

- [#32](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/32) Expose applyTodoChanges API ([@scalvert](https://github.com/scalvert))

#### :memo: Documentation

- [#31](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/31) [RFC] Todo due date spec ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v3.0.2 (2020-12-01)

#### :bug: Bug Fix

- [#30](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/30) Fix path for todo data so it's consistent on posix and win32 ([@renatoi](https://github.com/renatoi))

#### Committers: 1

- Renato Iwashima ([@renatoi](https://github.com/renatoi))

## v3.0.1 (2020-11-25)

#### :bug: Bug Fix

- [#29](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/29) Closes [#28](https://github.com/ember-template-lint/ember-template-lint-todo-utils/issues/28): file path consistency ([@renatoi](https://github.com/renatoi))

#### Committers: 1

- Renato Iwashima ([@renatoi](https://github.com/renatoi))

## v3.0.0 (2020-11-04)

#### :boom: Breaking Change

- [#24](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/24) Aligning APIs for consistency ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v2.3.0 (2020-10-26)

#### :rocket: Enhancement

- [#20](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/20) Adding API to determine if storage directory exists ([@scalvert](https://github.com/scalvert))

#### :bug: Bug Fix

- [#17](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/17) Ensure we're operating on relative paths vs. absolute ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v2.2.0 (2020-10-15)

#### :boom: Breaking Change

- [#16](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/16) Changes storage mechanism to use filePath based directories to store todo files. ([@scalvert](https://github.com/scalvert))
- [#13](https://github.com/ember-template-lint/ember-template-lint-todo-utils/pull/13) Simplify builder API. Change generatePendingFiles to take lint results ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v2.1.0 (2020-10-02)

#### :rocket: Enhancement

- [#10](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/10) Make pending lint messages map building public ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v2.0.0 (2020-10-02)

#### :boom: Breaking Change

- [#9](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/9) Cleanup of APIs/batch generation ([@scalvert](https://github.com/scalvert))

#### Committers: 1

- Steve Calvert ([@scalvert](https://github.com/scalvert))

## v1.0.0 (2020-10-01)

#### :rocket: Enhancement

- [#4](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/4) Differential update for single files ([@scalvert](https://github.com/scalvert))
- [#3](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/3) Remove old pending files when regenerating ([@scalvert](https://github.com/scalvert))

#### :house: Internal

- [#6](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/6) Add prepare script to package.json scripts. ([@rwjblue](https://github.com/rwjblue))
- [#2](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/2) Adding github actions ([@scalvert](https://github.com/scalvert))
- [#1](https://github.com/ember-template-lint/ember-template-lint-pending-utils/pull/1) Adding basic builder and io functionality ([@scalvert](https://github.com/scalvert))

#### Committers: 2

- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Steve Calvert ([@scalvert](https://github.com/scalvert))
