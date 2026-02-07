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
export interface LoadOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    body?: FormData | URLSearchParams | string;
    headers?: Record<string, string>;
}
export declare function load(url: string, progressCallback?: ProgressCallback, timeout?: number, options?: LoadOptions): Promise<LoadResult>;
export default load;
