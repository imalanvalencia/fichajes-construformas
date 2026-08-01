# OpenCode Database Schema

> SQLite database: `~/.local/share/opencode/opencode.db`

## Entity Relationship Diagram

```mermaid
erDiagram
    project ||--o{ session : "has sessions"
    project ||--o{ permission : "has permissions"
    project ||--o{ project_directory : "has directories"
    project ||--o{ workspace : "has workspaces"

    session ||--o{ message : "has messages"
    session ||--o{ session_message : "has session messages"
    session ||--o{ session_input : "has inputs"
    session ||--o{ session_context_epoch : "has context"
    session ||--o{ session_share : "can be shared"
    session ||--o{ todo : "has todos"
    session }o--o| session : "parent session"

    message ||--o{ part : "has parts"

    event_sequence ||--o{ event : "has events"

    account ||--o| account_state : "active account"
    account_state }o--|| account : "references"

    control_account {
        text email PK
        text url PK
    }

    %% ── Core Entities ──

    project {
        text id PK
        text worktree "root directory path"
        text vcs "version control type"
        text name
        text icon_url
        text icon_url_override
        text icon_color
        integer time_created
        integer time_updated
        integer time_initialized
        text sandboxes "JSON array"
        text commands "JSON array"
    }

    project_directory {
        text project_id FK
        text directory "directory path"
        text type
        text strategy
        integer time_created
    }

    workspace {
        text id PK
        text type
        text name
        text branch
        text directory
        text extra
        text project_id FK
        integer time_used
    }

    %% ── Session Layer ──

    session {
        text id PK
        text project_id FK
        text workspace_id FK
        text parent_id FK "parent session"
        text slug "URL-friendly name"
        text directory "working directory"
        text path
        text title
        text version
        text share_url
        integer summary_additions
        integer summary_deletions
        integer summary_files
        text summary_diffs
        text metadata "JSON"
        real cost
        integer tokens_input
        integer tokens_output
        integer tokens_reasoning
        integer tokens_cache_read
        integer tokens_cache_write
        text revert
        text permission
        text agent
        text model
        integer time_created
        integer time_updated
        integer time_compacting
        integer time_archived
    }

    session_input {
        text id PK
        text session_id FK
        text prompt "user input"
        text delivery
        integer admitted_seq
        integer promoted_seq
        integer time_created
    }

    session_message {
        text id PK
        text session_id FK
        text type "message type"
        integer seq "sequence number"
        integer time_created
        integer time_updated
        text data "JSON content"
    }

    session_context_epoch {
        text session_id PK,FK
        text baseline
        text snapshot
        integer baseline_seq
    }

    session_share {
        text session_id PK,FK
        text id
        text secret
        text url
        integer time_created
        integer time_updated
    }

    todo {
        text session_id FK
        text content
        text status
        text priority
        integer position
        integer time_created
        integer time_updated
    }

    %% ── Message Layer ──

    message {
        text id PK
        text session_id FK
        integer time_created
        integer time_updated
        text data "JSON content"
    }

    part {
        text id PK
        text message_id FK
        text session_id FK
        integer time_created
        integer time_updated
        text data "JSON content"
    }

    %% ── Event Sourcing ──

    event_sequence {
        text aggregate_id PK
        integer seq
        text owner_id
    }

    event {
        text id PK
        text aggregate_id FK
        integer seq
        text type "event type"
        text data "JSON payload"
    }

    %% ── Auth & Permissions ──

    account {
        text id PK
        text email
        text url
        text access_token
        text refresh_token
        integer token_expiry
        integer time_created
        integer time_updated
    }

    account_state {
        integer id PK
        text active_account_id FK
        text active_org_id
    }

    control_account {
        text email PK
        text url PK
        text access_token
        text refresh_token
        integer token_expiry
        integer active
        integer time_created
        integer time_updated
    }

    credential {
        text id PK
        text integration_id
        text label
        text value
        text connector_id
        text method_id
        integer active
        integer time_created
        integer time_updated
    }

    permission {
        text id PK
        text project_id FK
        text action
        text resource
        integer time_created
        integer time_updated
    }
```

---

## Table Reference

### Core

| Table | Purpose |
|-------|---------|
| `project` | Registered projects (repos). `worktree` = root path. |
| `project_directory` | Multiple directories per project (monorepo support). |
| `workspace` | Workspaces within a project (branch-based isolation). |

### Sessions

| Table | Purpose |
|-------|---------|
| `session` | Chat sessions. Links to project, tracks costs/tokens. |
| `session_input` | User prompts with delivery status and sequencing. |
| `session_message` | Low-level session events (tool calls, system events). |
| `session_context_epoch` | Context snapshots for compaction/recovery. |
| `session_share` | Public sharing links for sessions. |
| `todo` | Task list items within a session. |

### Messages

| Table | Purpose |
|-------|---------|
| `message` | Conversation messages (user + assistant turns). |
| `part` | Message parts (text, tool calls, tool results). |

### Event Sourcing

| Table | Purpose |
|-------|---------|
| `event_sequence` | Aggregate sequence counters. |
| `event` | Immutable event log per aggregate. |

### Auth

| Table | Purpose |
|-------|---------|
| `account` | User accounts with OAuth tokens. |
| `account_state` | Currently active account/org. |
| `control_account` | Control plane accounts (composite PK: email+url). |
| `credential` | API keys and integration credentials. |

### Other

| Table | Purpose |
|-------|---------|
| `permission` | Per-project action/resource permissions. |
| `data_migration` | Migration tracking. |
| `migration` | Schema migration tracking. |

---

## Key Relationships

```
project (1) ──── (N) session ──── (N) message ──── (N) part
    │                  │
    │                  ├── (N) session_input
    │                  ├── (N) session_message
    │                  ├── (1) session_context_epoch
    │                  ├── (0..1) session_share
    │                  └── (N) todo
    │
    ├── (N) permission
    ├── (N) project_directory
    └── (N) workspace
```

## Indexes

| Table | Index | Columns |
|-------|-------|---------|
| `event` | `event_aggregate_seq_idx` | `(aggregate_id, seq)` UNIQUE |
| `event` | `event_aggregate_type_seq_idx` | `(aggregate_id, type, seq)` |
| `permission` | `permission_project_action_resource_idx` | `(project_id, action, resource)` UNIQUE |
| `message` | `message_session_time_created_id_idx` | `(session_id, time_created, id)` |
| `part` | `part_message_id_id_idx` | `(message_id, id)` |
| `part` | `part_session_idx` | `(session_id)` |
| `session` | `session_project_idx` | `(project_id)` |
| `session` | `session_workspace_idx` | `(workspace_id)` |
| `session` | `session_parent_idx` | `(parent_id)` |
| `session_input` | `session_input_session_pending_delivery_seq_idx` | `(session_id, promoted_seq, delivery, admitted_seq)` |
| `session_input` | `session_input_session_admitted_seq_idx` | `(session_id, admitted_seq)` UNIQUE |
| `session_input` | `session_input_session_promoted_seq_idx` | `(session_id, promoted_seq)` UNIQUE |
| `session_message` | `session_message_session_seq_idx` | `(session_id, seq)` UNIQUE |
| `session_message` | `session_message_session_type_seq_idx` | `(session_id, type, seq)` |
| `session_message` | `session_message_session_time_created_id_idx` | `(session_id, time_created, id)` |
| `session_message` | `session_message_time_created_idx` | `(time_created)` |
| `todo` | `todo_session_idx` | `(session_id)` |
