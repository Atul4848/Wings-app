// decorator will make sure that undefined props in data object that provided into constructor
// will be replaced with default values, also it will remove array cross-ref links when
// creating new class from class

// Examples:
// const data = new DecoratedModel();
// data.name = undefined;
// const newData = new DecoratedModel(data);
// newData.name.toLowerCase() - works ok because it was re-initiated with default value empty string
// data.name = null;
// const anotherData = new DecoratedModel(data);
// anotherData.name - will be equal to null, because we only check for undefined

// usage
// @undefinedProtection
// class DecoratedModel {}
export function modelProtection<T extends { new (...args: any[]): {} }>(constructor: T) {}
