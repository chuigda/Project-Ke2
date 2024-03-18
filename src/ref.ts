export interface Ref<T> {
    value: T
}

export function ref<T>(value: T): Ref<T> {
    return { value }
}
