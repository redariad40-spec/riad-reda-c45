import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";



@ValidatorConstraint({ name: 'Check_Fields_Exist[', async: false })
export class ChekAnyFiledsAreApplied implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {

        return (
            Object.keys(args.object).length > 0
            &&
            Object.keys(args.object).filter((arg) => { return arg != undefined }).length > 0
        );
    }
    defaultMessage(validationArguments?: ValidationArguments): string {
        return " All Updated Fileds Are Empty"
    }
}

export function containFiled(validationOptions?: ValidationOptions) {
    return function (constructor: Function) {
        registerDecorator({
            target: constructor,
            propertyName: undefined!,
            options: validationOptions,
            constraints: [],
            validator: ChekAnyFiledsAreApplied,
        });
    };
}