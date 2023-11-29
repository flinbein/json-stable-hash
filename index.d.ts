import type {BinaryToTextEncoding, Hash} from "node:crypto";

export default function(obj: any, algorithm: string, encoding?: BinaryToTextEncoding): string;