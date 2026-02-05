export interface LoadProgress {
    loaded: number;
    total: number;
    elapsedTime: number;
}
export interface LoadResult {
    text: string;
    progress: LoadProgress;
}
type ProgressCallback = (progress: LoadProgress) => void;
export declare function load(url: string, progressCallback?: ProgressCallback, timeout?: number): Promise<LoadResult>;
export default load;
