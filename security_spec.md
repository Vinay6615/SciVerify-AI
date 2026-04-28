# Security Specification - SciVerify AI

## Data Invariants
1. **Ownership**: Every `Audit` document must have a `userId` field that matches the creator's UID.
2. **Immutability**: Once an `Audit` is written, it cannot be modified. This ensures the integrity of the scientific review.
3. **Audit Trail**: The `createdAt` field must be set to the server-side request time.
4. **Scope**: Users can only access (read/list) audits they own.

## The "Dirty Dozen" (Attack Payloads)
The following attempts must be rejected by Firestore Security Rules:

1. **Identity Spoofing**: Create an audit with `userId: "attacker_id"` while authenticated as `victim_id`. (Rejected by `data.userId == request.auth.uid`)
2. **State Tampering**: Attempt to `update` an existing audit's `authenticity.score`. (Rejected by `allow update: if false`)
3. **Information Leak**: Attempt to `get` an audit document with ID `some_other_id` without being the owner. (Rejected by `resource.data.userId == request.auth.uid`)
4. **Mass Scraping**: Attempt to `list` all audits in the collection. (Rejected by `resource.data.userId == request.auth.uid` enforcement on list)
5. **Timestamp Fraud**: Setting `createdAt` to a future date. (Rejected by `data.createdAt == request.time`)
6. **Payload Poisoning**: Injecting 1MB of junk into the `title` field. (Rejected by `data.title.size() <= 500`)
7. **Orphaned Writes**: Creating an audit without a `userId`. (Rejected by type and value checks)
8. **Malicious Deletion**: Attempting to `delete` an audit owned by another user. (Rejected by `resource.data.userId == request.auth.uid`)
9. **Anonymous Injection**: Attempting to write without authentication. (Rejected by `request.auth != null`)
10. **Shadow Fields**: Adding extra fields like `isAdmin: true` to the document. (Note: Rules use specific field checks, though `hasOnly` could be added for stricter enforcement if schema evolves).
11. **ID Poisoning**: Using a 1KB string as the document ID. (Rejected by `allow create` logic via default length limits and custom ID validation if applied).
12. **Cross-Tenant Read**: Trying to query audits using a `where` clause on a different `userId`. (Rejected by rule-side enforcement).

## Conflicts Report
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|--------------------|--------------------|
| `/audits`  | Protected         | Impossible (No Update) | Protected (Size check) |
| `/test`    | Protected (Deny)  | N/A                | N/A                |
