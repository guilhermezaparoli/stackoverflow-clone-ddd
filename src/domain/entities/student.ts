import { Entity } from "../../core/entities/entity"

interface StudentProps {
    name: string
}
export class Student extends Entity<StudentProps> {
    static create(props: StudentProps) {
        const student = new Student({
            ...props
        })

        return student
    }

}