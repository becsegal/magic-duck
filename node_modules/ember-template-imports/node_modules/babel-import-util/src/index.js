"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportUtil = void 0;
class ImportUtil {
    constructor(t, program) {
        this.t = t;
        this.program = program;
    }
    removeImport(moduleSpecifier, exportedName) {
        for (let topLevelPath of this.program.get('body')) {
            if (!topLevelPath.isImportDeclaration() ||
                topLevelPath.get('source').node.value !== moduleSpecifier) {
                continue;
            }
            let importSpecifierPath = topLevelPath
                .get('specifiers')
                .find((specifierPath) => exportedName === 'default'
                ? specifierPath.isImportDefaultSpecifier()
                : specifierPath.isImportSpecifier() &&
                    name(specifierPath.node.imported) === exportedName);
            if (importSpecifierPath) {
                if (topLevelPath.node.specifiers.length === 1) {
                    topLevelPath.remove();
                }
                else {
                    importSpecifierPath.remove();
                }
            }
        }
    }
    // Import the given value (if needed) and return an Identifier representing
    // it.
    import(
    // the spot at which you will insert the Identifier we return to you
    target, 
    // the path to the module you're importing from
    moduleSpecifier, 
    // the name you're importing from that module (use "default" for the default
    // export)
    exportedName, 
    // Optional hint for helping us pick a name for the imported binding
    nameHint) {
        var _a;
        let declaration = this.program
            .get('body')
            .find((elt) => elt.isImportDeclaration() && elt.node.source.value === moduleSpecifier);
        if (declaration) {
            let specifier = declaration
                .get('specifiers')
                .find((spec) => exportedName === 'default'
                ? spec.isImportDefaultSpecifier()
                : spec.isImportSpecifier() && name(spec.node.imported) === exportedName);
            if (specifier && ((_a = target.scope.getBinding(specifier.node.local.name)) === null || _a === void 0 ? void 0 : _a.kind) === 'module') {
                return this.t.identifier(specifier.node.local.name);
            }
            else {
                return this.addSpecifier(target, declaration, exportedName, nameHint);
            }
        }
        else {
            this.program.node.body.unshift(this.t.importDeclaration([], this.t.stringLiteral(moduleSpecifier)));
            return this.addSpecifier(target, this.program.get(`body.0`), exportedName, nameHint);
        }
    }
    addSpecifier(target, declaration, exportedName, nameHint) {
        let local = this.t.identifier(unusedNameLike(target, desiredName(nameHint, exportedName, target)));
        let specifier = exportedName === 'default'
            ? this.t.importDefaultSpecifier(local)
            : this.t.importSpecifier(local, this.t.identifier(exportedName));
        declaration.node.specifiers.push(specifier);
        declaration.scope.registerBinding('module', declaration.get(`specifiers.${declaration.node.specifiers.length - 1}`));
        return local;
    }
}
exports.ImportUtil = ImportUtil;
function unusedNameLike(path, name) {
    let candidate = name;
    let counter = 0;
    while (path.scope.hasBinding(candidate)) {
        candidate = `${name}${counter++}`;
    }
    return candidate;
}
function name(node) {
    if (node.type === 'StringLiteral') {
        return node.value;
    }
    else {
        return node.name;
    }
}
function desiredName(nameHint, exportedName, target) {
    if (nameHint) {
        return nameHint;
    }
    if (exportedName === 'default') {
        if (target.isIdentifier()) {
            return target.node.name;
        }
        else {
            return target.scope.generateUidIdentifierBasedOnNode(target.node).name;
        }
    }
    else {
        return exportedName;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFLQSxNQUFhLFVBQVU7SUFDckIsWUFBb0IsQ0FBYSxFQUFVLE9BQTRCO1FBQW5ELE1BQUMsR0FBRCxDQUFDLENBQVk7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFxQjtJQUFHLENBQUM7SUFFM0UsWUFBWSxDQUFDLGVBQXVCLEVBQUUsWUFBb0I7UUFDeEQsS0FBSyxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUNqRCxJQUNFLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFO2dCQUNuQyxZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssZUFBZSxFQUN6RDtnQkFDQSxTQUFTO2FBQ1Y7WUFFRCxJQUFJLG1CQUFtQixHQUFHLFlBQVk7aUJBQ25DLEdBQUcsQ0FBQyxZQUFZLENBQUM7aUJBQ2pCLElBQUksQ0FBQyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQ3RCLFlBQVksS0FBSyxTQUFTO2dCQUN4QixDQUFDLENBQUMsYUFBYSxDQUFDLHdCQUF3QixFQUFFO2dCQUMxQyxDQUFDLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFO29CQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxZQUFZLENBQ3ZELENBQUM7WUFDSixJQUFJLG1CQUFtQixFQUFFO2dCQUN2QixJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7b0JBQzdDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQztpQkFDdkI7cUJBQU07b0JBQ0wsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUM7aUJBQzlCO2FBQ0Y7U0FDRjtJQUNILENBQUM7SUFFRCwyRUFBMkU7SUFDM0UsTUFB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QWpHRCxnQ0FpR0M7QUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFzQixFQUFFLElBQVk7SUFDMUQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNoQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ3ZDLFNBQVMsR0FBRyxHQUFHLElBQUksR0FBRyxPQUFPLEVBQUUsRUFBRSxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxTQUFTLENBQUM7QUFDbkIsQ0FBQztBQUVELFNBQVMsSUFBSSxDQUFDLElBQW9DO0lBQ2hELElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxlQUFlLEVBQUU7UUFDakMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0tBQ25CO1NBQU07UUFDTCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7QUFDSCxDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsUUFBNEIsRUFBRSxZQUFvQixFQUFFLE1BQXdCO0lBQy9GLElBQUksUUFBUSxFQUFFO1FBQ1osT0FBTyxRQUFRLENBQUM7S0FDakI7SUFDRCxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7UUFDOUIsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDekIsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztTQUN6QjthQUFNO1lBQ0wsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUM7U0FDeEU7S0FDRjtTQUFNO1FBQ0wsT0FBTyxZQUFZLENBQUM7S0FDckI7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBOb2RlUGF0aCB9IGZyb20gJ0BiYWJlbC90cmF2ZXJzZSc7XG5pbXBvcnQgdHlwZSAqIGFzIHQgZnJvbSAnQGJhYmVsL3R5cGVzJztcblxudHlwZSBCYWJlbFR5cGVzID0gdHlwZW9mIHQ7XG5cbmV4cG9ydCBjbGFzcyBJbXBvcnRVdGlsIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0OiBCYWJlbFR5cGVzLCBwcml2YXRlIHByb2dyYW06IE5vZGVQYXRoPHQuUHJvZ3JhbT4pIHt9XG5cbiAgcmVtb3ZlSW1wb3J0KG1vZHVsZVNwZWNpZmllcjogc3RyaW5nLCBleHBvcnRlZE5hbWU6IHN0cmluZykge1xuICAgIGZvciAobGV0IHRvcExldmVsUGF0aCBvZiB0aGlzLnByb2dyYW0uZ2V0KCdib2R5JykpIHtcbiAgICAgIGlmIChcbiAgICAgICAgIXRvcExldmVsUGF0aC5pc0ltcG9ydERlY2xhcmF0aW9uKCkgfHxcbiAgICAgICAgdG9wTGV2ZWxQYXRoLmdldCgnc291cmNlJykubm9kZS52YWx1ZSAhPT0gbW9kdWxlU3BlY2lmaWVyXG4gICAgICApIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGxldCBpbXBvcnRTcGVjaWZpZXJQYXRoID0gdG9wTGV2ZWxQYXRoXG4gICAgICAgIC5nZXQoJ3NwZWNpZmllcnMnKVxuICAgICAgICAuZmluZCgoc3BlY2lmaWVyUGF0aCkgPT5cbiAgICAgICAgICBleHBvcnRlZE5hbWUgPT09ICdkZWZhdWx0J1xuICAgICAgICAgICAgPyBzcGVjaWZpZXJQYXRoLmlzSW1wb3J0RGVmYXVsdFNwZWNpZmllcigpXG4gICAgICAgICAgICA6IHNwZWNpZmllclBhdGguaXNJbXBvcnRTcGVjaWZpZXIoKSAmJlxuICAgICAgICAgICAgICBuYW1lKHNwZWNpZmllclBhdGgubm9kZS5pbXBvcnRlZCkgPT09IGV4cG9ydGVkTmFtZVxuICAgICAgICApO1xuICAgICAgaWYgKGltcG9ydFNwZWNpZmllclBhdGgpIHtcbiAgICAgICAgaWYgKHRvcExldmVsUGF0aC5ub2RlLnNwZWNpZmllcnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdG9wTGV2ZWxQYXRoLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGltcG9ydFNwZWNpZmllclBhdGgucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBJbXBvcnQgdGhlIGdpdmVuIHZhbHVlIChpZiBuZWVkZWQpIGFuZCByZXR1cm4gYW4gSWRlbnRpZmllciByZXByZXNlbnRpbmdcbiAgLy8gaXQuXG4gIGltcG9ydChcbiAgICAvLyB0aGUgc3BvdCBhdCB3aGljaCB5b3Ugd2lsbCBpbnNlcnQgdGhlIElkZW50aWZpZXIgd2UgcmV0dXJuIHRvIHlvdVxuICAgIHRhcmdldDogTm9kZVBhdGg8dC5Ob2RlPixcblxuICAgIC8vIHRoZSBwYXRoIHRvIHRoZSBtb2R1bGUgeW91J3JlIGltcG9ydGluZyBmcm9tXG4gICAgbW9kdWxlU3BlY2lmaWVyOiBzdHJpbmcsXG5cbiAgICAvLyB0aGUgbmFtZSB5b3UncmUgaW1wb3J0aW5nIGZyb20gdGhhdCBtb2R1bGUgKHVzZSBcImRlZmF1bHRcIiBmb3IgdGhlIGRlZmF1bHRcbiAgICAvLyBleHBvcnQpXG4gICAgZXhwb3J0ZWROYW1lOiBzdHJpbmcsXG5cbiAgICAvLyBPcHRpb25hbCBoaW50IGZvciBoZWxwaW5nIHVzIHBpY2sgYSBuYW1lIGZvciB0aGUgaW1wb3J0ZWQgYmluZGluZ1xuICAgIG5hbWVIaW50Pzogc3RyaW5nXG4gICk6IHQuSWRlbnRpZmllciB7XG4gICAgbGV0IGRlY2xhcmF0aW9uID0gdGhpcy5wcm9ncmFtXG4gICAgICAuZ2V0KCdib2R5JylcbiAgICAgIC5maW5kKChlbHQpID0+IGVsdC5pc0ltcG9ydERlY2xhcmF0aW9uKCkgJiYgZWx0Lm5vZGUuc291cmNlLnZhbHVlID09PSBtb2R1bGVTcGVjaWZpZXIpIGFzXG4gICAgICB8IHVuZGVmaW5lZFxuICAgICAgfCBOb2RlUGF0aDx0LkltcG9ydERlY2xhcmF0aW9uPjtcbiAgICBpZiAoZGVjbGFyYXRpb24pIHtcbiAgICAgIGxldCBzcGVjaWZpZXIgPSBkZWNsYXJhdGlvblxuICAgICAgICAuZ2V0KCdzcGVjaWZpZXJzJylcbiAgICAgICAgLmZpbmQoKHNwZWMpID0+XG4gICAgICAgICAgZXhwb3J0ZWROYW1lID09PSAnZGVmYXVsdCdcbiAgICAgICAgICAgID8gc3BlYy5pc0ltcG9ydERlZmF1bHRTcGVjaWZpZXIoKVxuICAgICAgICAgICAgOiBzcGVjLmlzSW1wb3J0U3BlY2lmaWVyKCkgJiYgbmFtZShzcGVjLm5vZGUuaW1wb3J0ZWQpID09PSBleHBvcnRlZE5hbWVcbiAgICAgICAgKSBhcyB1bmRlZmluZWQgfCBOb2RlUGF0aDx0LkltcG9ydFNwZWNpZmllcj4gfCBOb2RlUGF0aDx0LkltcG9ydERlZmF1bHRTcGVjaWZpZXI+O1xuICAgICAgaWYgKHNwZWNpZmllciAmJiB0YXJnZXQuc2NvcGUuZ2V0QmluZGluZyhzcGVjaWZpZXIubm9kZS5sb2NhbC5uYW1lKT8ua2luZCA9PT0gJ21vZHVsZScpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudC5pZGVudGlmaWVyKHNwZWNpZmllci5ub2RlLmxvY2FsLm5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkU3BlY2lmaWVyKHRhcmdldCwgZGVjbGFyYXRpb24sIGV4cG9ydGVkTmFtZSwgbmFtZUhpbnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb2dyYW0ubm9kZS5ib2R5LnVuc2hpZnQoXG4gICAgICAgIHRoaXMudC5pbXBvcnREZWNsYXJhdGlvbihbXSwgdGhpcy50LnN0cmluZ0xpdGVyYWwobW9kdWxlU3BlY2lmaWVyKSlcbiAgICAgICk7XG4gICAgICByZXR1cm4gdGhpcy5hZGRTcGVjaWZpZXIoXG4gICAgICAgIHRhcmdldCxcbiAgICAgICAgdGhpcy5wcm9ncmFtLmdldChgYm9keS4wYCkgYXMgTm9kZVBhdGg8dC5JbXBvcnREZWNsYXJhdGlvbj4sXG4gICAgICAgIGV4cG9ydGVkTmFtZSxcbiAgICAgICAgbmFtZUhpbnRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRTcGVjaWZpZXIoXG4gICAgdGFyZ2V0OiBOb2RlUGF0aDx0Lk5vZGU+LFxuICAgIGRlY2xhcmF0aW9uOiBOb2RlUGF0aDx0LkltcG9ydERlY2xhcmF0aW9uPixcbiAgICBleHBvcnRlZE5hbWU6IHN0cmluZyxcbiAgICBuYW1lSGludDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICk6IHQuSWRlbnRpZmllciB7XG4gICAgbGV0IGxvY2FsID0gdGhpcy50LmlkZW50aWZpZXIoXG4gICAgICB1bnVzZWROYW1lTGlrZSh0YXJnZXQsIGRlc2lyZWROYW1lKG5hbWVIaW50LCBleHBvcnRlZE5hbWUsIHRhcmdldCkpXG4gICAgKTtcbiAgICBsZXQgc3BlY2lmaWVyID1cbiAgICAgIGV4cG9ydGVkTmFtZSA9PT0gJ2RlZmF1bHQnXG4gICAgICAgID8gdGhpcy50LmltcG9ydERlZmF1bHRTcGVjaWZpZXIobG9jYWwpXG4gICAgICAgIDogdGhpcy50LmltcG9ydFNwZWNpZmllcihsb2NhbCwgdGhpcy50LmlkZW50aWZpZXIoZXhwb3J0ZWROYW1lKSk7XG4gICAgZGVjbGFyYXRpb24ubm9kZS5zcGVjaWZpZXJzLnB1c2goc3BlY2lmaWVyKTtcbiAgICBkZWNsYXJhdGlvbi5zY29wZS5yZWdpc3RlckJpbmRpbmcoXG4gICAgICAnbW9kdWxlJyxcbiAgICAgIGRlY2xhcmF0aW9uLmdldChgc3BlY2lmaWVycy4ke2RlY2xhcmF0aW9uLm5vZGUuc3BlY2lmaWVycy5sZW5ndGggLSAxfWApIGFzIE5vZGVQYXRoXG4gICAgKTtcbiAgICByZXR1cm4gbG9jYWw7XG4gIH1cbn1cblxuZnVuY3Rpb24gdW51c2VkTmFtZUxpa2UocGF0aDogTm9kZVBhdGg8dC5Ob2RlPiwgbmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGNhbmRpZGF0ZSA9IG5hbWU7XG4gIGxldCBjb3VudGVyID0gMDtcbiAgd2hpbGUgKHBhdGguc2NvcGUuaGFzQmluZGluZyhjYW5kaWRhdGUpKSB7XG4gICAgY2FuZGlkYXRlID0gYCR7bmFtZX0ke2NvdW50ZXIrK31gO1xuICB9XG4gIHJldHVybiBjYW5kaWRhdGU7XG59XG5cbmZ1bmN0aW9uIG5hbWUobm9kZTogdC5TdHJpbmdMaXRlcmFsIHwgdC5JZGVudGlmaWVyKTogc3RyaW5nIHtcbiAgaWYgKG5vZGUudHlwZSA9PT0gJ1N0cmluZ0xpdGVyYWwnKSB7XG4gICAgcmV0dXJuIG5vZGUudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5vZGUubmFtZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZXNpcmVkTmFtZShuYW1lSGludDogc3RyaW5nIHwgdW5kZWZpbmVkLCBleHBvcnRlZE5hbWU6IHN0cmluZywgdGFyZ2V0OiBOb2RlUGF0aDx0Lk5vZGU+KSB7XG4gIGlmIChuYW1lSGludCkge1xuICAgIHJldHVybiBuYW1lSGludDtcbiAgfVxuICBpZiAoZXhwb3J0ZWROYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICBpZiAodGFyZ2V0LmlzSWRlbnRpZmllcigpKSB7XG4gICAgICByZXR1cm4gdGFyZ2V0Lm5vZGUubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRhcmdldC5zY29wZS5nZW5lcmF0ZVVpZElkZW50aWZpZXJCYXNlZE9uTm9kZSh0YXJnZXQubm9kZSkubmFtZTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGV4cG9ydGVkTmFtZTtcbiAgfVxufVxuIl19