export default function babelFilter(skipBabel: {
    package: string;
    semverRange?: string;
}[], appRoot: string): (filename: string) => boolean;
