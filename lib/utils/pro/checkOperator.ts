import operators from '@/data/operators.json'

type Operator = {
  personalNumber: number
  name: string
}

const checkOperator = (personalNumber: number): Operator | null => {
  const operator = operators.find(
    (operator) => operator.personalNumber === personalNumber
  )
  return operator || null
}

export default checkOperator
