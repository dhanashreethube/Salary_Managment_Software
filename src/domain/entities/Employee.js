/**
 * Employee Domain Entity
 */
export function createEmployee({
  id,
  employeeId,
  firstName,
  lastName,
  email,
  department,
  role,
  country,
  currency,
  createdAt = new Date(),
}) {
  if (!employeeId || typeof employeeId !== "string" || employeeId.trim() === "") {
    throw new Error("Invalid Employee ID");
  }
  if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
    throw new Error("Invalid First Name");
  }
  if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
    throw new Error("Invalid Last Name");
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new Error("Invalid Email Address");
  }
  if (!department || typeof department !== "string" || department.trim() === "") {
    throw new Error("Invalid Department");
  }
  if (!role || typeof role !== "string" || role.trim() === "") {
    throw new Error("Invalid Role");
  }
  if (!country || typeof country !== "string" || country.trim() === "") {
    throw new Error("Invalid Country");
  }
  if (!currency || typeof currency !== "string" || currency.trim() === "") {
    throw new Error("Invalid Currency");
  }

  return Object.freeze({
    id,
    employeeId: employeeId.trim(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    department: department.trim(),
    role: role.trim(),
    country: country.trim(),
    currency: currency.trim().toUpperCase(),
    createdAt,
    fullName: `${firstName.trim()} ${lastName.trim()}`,
  });
}
