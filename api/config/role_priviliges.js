module.exports = {
    privGroups: [
        {
           id: "USERS",
           name: "Users Permissions"
        },
        {
            id: "CATEGORIES",
            name: "Categories Permissions"
        },
        {
            id: "ROLES",
            name: "Roles Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "Audit Logs Permissions"
        },
        
    ],

    privileges: [
        {
            key: "user_view",
            name: "View User",
            group: "USERS",
            description: "View User"
        },
        {
            key: "user_create",
            name: "Create User",
            group: "USERS",
            description: "Create User"
        },
        {
            key: "user_update",
            name: "Update User",
            group: "USERS",
            description: "Update User"
        },
        {
            key: "user_delete",
            name: "Delete User",
            group: "USERS",
            description: "Delete User"
        },
        {
            key: "category_view",
            name: "View Category",
            group: "CATEGORIES",
            description: "View Category"
        },
        {
            key: "category_create",
            name: "Create Category",
            group: "CATEGORIES",
            description: "Create Category"
        },
        {
            key: "category_update",
            name: "Update Category",
            group: "CATEGORIES",
            description: "Update Category"
        },
        {
            key: "category_delete",
            name: "Delete Category",
            group: "CATEGORIES",
            description: "Delete Category"
        },
        {
            key: "auditlog_view",
            name: "View Audit Log",
            group: "AUDITLOGS",
            description: "View Audit Log"
        },
        {
            key: "role_view",
            name: "View Role",
            group: "ROLES",
            description: "View Role"
        },
        {
            key: "role_create",
            name: "Create Role",
            group: "ROLES",
            description: "Create Role"
        },
        {
            key: "role_update",
            name: "Update Role",
            group: "ROLES",
            description: "Update Role"
        },
        {
            key: "role_delete",
            name: "Delete Role",
            group: "ROLES",
            description: "Delete Role"
        }
    ]
}