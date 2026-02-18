# Golf Fantasy API Endpoints

## Base URLs

| Environment | Raw Backend URL | Frontend Proxy URL |
|-------------|-----------------|-------------------|
| **Production/Staging** | `<CLOUD_RUN_URL>` | `/api` |
| **Local Development** | `http://127.0.0.1:5000` | `/api` (when configured in next.config.mjs) |

All endpoints are accessed via the frontend proxy at `/api/:path*` which rewrites to the backend.

---

## Authentication

Most endpoints require Firebase authentication. Include the Bearer token in the `Authorization` header:

```
Authorization: Bearer <firebase_id_token>
```

---

## Health Check (`/health`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| GET | `/health/` | `/api/health/` | ❌ | Basic API health check |
| GET | `/health/db-health` | `/api/health/db-health` | ❌ | Database connection health check |

### Example Responses

**GET `/api/health/`**
```json
{
  "status": "healthy",
  "message": "API is running"
}
```

**GET `/api/health/db-health`**
```json
{
  "status": "healthy",
  "message": "Database connection successful",
  "database": "connected"
}
```

---

## User (`/user`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| GET | `/user/current` | `/api/user/current` | ✅ | Get current user's most recent pick |
| GET | `/user/history/<league_id>` | `/api/user/history/<league_id>` | ✅ | Get pick history for authenticated user in specified league |
| POST | `/user/submit` | `/api/user/submit` | ✅ | Submit a pick (DEPRECATED - use `/pick/submit`) |
| GET | `/user/leagues` | `/api/user/leagues` | ✅ | Get all leagues for authenticated user |
| GET | `/user/profile` | `/api/user/profile` | ✅ | Get authenticated user's profile |

### Example Responses

**GET `/api/user/leagues`**
```json
{
  "success": true,
  "data": [
    {
      "league_member_id": 123,
      "league_id": 1,
      "league_name": "Squilliam's League",
      "is_active": true
    }
  ]
}
```

**GET `/api/user/profile`**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "display_name": "John Doe",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "leagues": [
      {
        "league_member_id": 123,
        "league_id": 1,
        "league_name": "Squilliam's League",
        "role_id": 3,
        "role_name": "Member",
        "is_active": true
      }
    ]
  }
}
```

---

## League (`/league`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| GET | `/league/scoreboard/<league_id>` | `/api/league/scoreboard/<league_id>` | ✅ | Get league leaderboard/scoreboard |
| GET | `/league/membership` | `/api/league/membership` | ✅ | Check if user has league membership (DEPRECATED) |
| GET | `/league/member/<league_member_id>/pick-history` | `/api/league/member/<league_member_id>/pick-history` | ❌ | Get pick history for a specific league member |

### Example Responses

**GET `/api/league/scoreboard/1`**
```json
{
  "status": "success",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "name": "John Doe",
        "first_name": "John",
        "last_name": "Doe",
        "avatar_url": "https://...",
        "score": 15000,
        "leagueMemberId": 123,
        "wins": 2,
        "missedPicks": 0
      },
      {
        "rank": 2,
        "name": "Jane Smith",
        "first_name": "Jane",
        "last_name": "Smith",
        "avatar_url": null,
        "score": 12500,
        "leagueMemberId": 124,
        "wins": 1,
        "missedPicks": 1
      }
    ]
  },
  "message": "Retrieved leaderboard successfully."
}
```

**GET `/api/league/membership`**
```json
{
  "hasLeague": true
}
```

**GET `/api/league/member/123/pick-history`**
```json
{
  "member": {
    "id": 123,
    "display_name": "John Doe",
    "first_name": "John",
    "last_name": "Doe"
  },
  "picks": [
    {
      "tournament": {
        "name": "The Masters",
        "date": "2024-04-11",
        "is_major": true
      },
      "golfer": {
        "name": "Scottie Scheffler",
        "id": 456,
        "datagolf_id": 18846
      },
      "result": {
        "result": "1",
        "status": "active",
        "score_to_par": -10
      },
      "points": 156.25,
      "pick_status": {
        "is_no_pick": false,
        "is_duplicate_pick": false
      },
      "is_future": false
    },
    {
      "tournament": {
        "name": "PGA Championship",
        "date": "2024-05-16",
        "is_major": true
      },
      "golfer": null,
      "result": null,
      "points": 0,
      "pick_status": {
        "is_no_pick": false,
        "is_duplicate_pick": false
      },
      "is_future": true
    }
  ],
  "summary": {
    "total_picks": 15,
    "total_points": 425.50,
    "majors_played": 2,
    "missed_picks": 1,
    "duplicate_picks": 0,
    "wins": 1
  }
}
```

---

## Tournament (`/tournament`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| GET | `/tournament/most-recent/<league_id>` | `/api/tournament/most-recent/<league_id>` | ❌ | Get most recent tournament for league |
| GET | `/tournament/upcoming/<league_id>` | `/api/tournament/upcoming/<league_id>` | ❌ | Get upcoming tournament for league |
| GET | `/tournament/roster` | `/api/tournament/roster` | ❌ | Get upcoming tournament roster |
| GET | `/tournament/dd/<league_member_id>?tournament_id=<id>` | `/api/tournament/dd/<league_member_id>?tournament_id=<id>` | ✅ | Get dropdown data for golfer selection |
| GET | `/tournament/current/<league_id>` | `/api/tournament/current/<league_id>` | ❌ | Get current tournament state with timing info |

### Example Responses

**GET `/api/tournament/current/1`**
```json
{
  "success": true,
  "recent_tournament": {
    "id": 990,
    "name": "The Masters",
    "start_date": "2024-04-11",
    "is_major": true
  },
  "upcoming_tournament": {
    "id": 991,
    "name": "RBC Heritage",
    "start_date": "2024-04-18",
    "is_major": false
  },
  "timing": {
    "picks_open": true,
    "deadline": "2024-04-18T11:00:00Z"
  },
  "state": {
    "tournament_live": false,
    "picks_locked": false
  }
}
```

**GET `/api/tournament/upcoming/1` (no upcoming tournaments)**
```json
{
  "success": true,
  "message": "No upcoming tournaments scheduled",
  "has_tournament": false,
  "most_recent": {
    "id": 990,
    "name": "The Masters",
    "start_date": "2024-04-11"
  }
}
```

---

## Pick (`/pick`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| POST | `/pick/submit` | `/api/pick/submit` | ✅ | Submit a pick |
| GET | `/pick/current/<league_member_id>?tournament_id=<id>` | `/api/pick/current/<league_member_id>?tournament_id=<id>` | ✅ | Get current pick for tournament |
| GET | `/pick/field_stats/<tournament_id>` | `/api/pick/field_stats/<tournament_id>` | ❌ | Get field statistics for tournament |

### Request Bodies

**POST `/api/pick/submit`**
```json
{
  "league_member_id": 123,
  "tournament_id": 456,
  "golfer_id": 789
}
```

### Example Responses

**GET `/api/pick/current/123?tournament_id=991`** (has pick)
```json
{
  "status": "success",
  "has_pick": true,
  "golfer_id": 789,
  "golfer_name": "Scottie Scheffler",
  "tournament_id": 991
}
```

**GET `/api/pick/current/123?tournament_id=991`** (no pick)
```json
{
  "status": "success",
  "has_pick": false,
  "message": "No pick found for this tournament"
}
```

---

## League Picks (`/league_picks`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| GET | `/league_picks/<league_id>` | `/api/league_picks/<league_id>` | ✅ | Get current week picks for all league members |

### Example Responses

**GET `/api/league_picks/1`**
```json
{
  "success": true,
  "data": {
    "tournament": {
      "id": 991,
      "name": "RBC Heritage",
      "start_date": "2024-04-18",
      "is_major": false,
      "week_number": 15,
      "is_ongoing": true
    },
    "picks": [
      {
        "member": {
          "id": 123,
          "name": "John Doe",
          "first_name": "John",
          "last_name": "Doe",
          "avatar_url": "https://..."
        },
        "pick": {
          "golfer_id": 789,
          "golfer_first_name": "Scottie",
          "golfer_last_name": "Scheffler",
          "golfer_country_code": "USA",
          "datagolf_id": 18846,
          "status": "active",
          "score_to_par": -5,
          "position": "T3",
          "points": 35.50,
          "is_duplicate": false
        }
      },
      {
        "member": {
          "id": 124,
          "name": "Jane Smith",
          "first_name": "Jane",
          "last_name": "Smith",
          "avatar_url": null
        },
        "pick": null
      }
    ]
  }
}
```

---

## Live Tournament (`/live_results`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| GET | `/live_results/live` | `/api/live_results/live` | ❌ | Get current live tournament state |
| GET | `/live_results/big_fetch` | `/api/live_results/big_fetch` | ✅ | Get comprehensive tournament data |

### Example Responses

**GET `/api/live_results/live`**
```json
{
  "event_name": "RBC Heritage",
  "course_name": "Harbour Town Golf Links",
  "last_updated": "2024-04-19T15:30:00Z",
  "players": {
    "18846": {
      "bio": {
        "name": "Scottie Scheffler",
        "datagolf_rank": 1,
        "owgr_rank": 1,
        "country_code": "USA"
      },
      "course_fit": {
        "age": 27,
        "baseline_pred": 0.15,
        "final_pred": 0.18,
        "course_history_adjustment": 0.02,
        "course_fit_adjustment": 0.01
      },
      "predictions": {
        "baseline": {
          "win": 0.15,
          "top_5": 0.45,
          "top_10": 0.62,
          "make_cut": 0.95
        }
      },
      "skill_ratings": {
        "ranks": {
          "sg_total": 1,
          "sg_ott": 3,
          "sg_app": 1,
          "sg_arg": 8,
          "sg_putt": 12
        },
        "values": {
          "sg_total": 2.45,
          "sg_ott": 0.85,
          "sg_app": 1.10,
          "sg_arg": 0.35,
          "sg_putt": 0.15,
          "driving_dist": 305.2,
          "driving_acc": 62.5
        }
      }
    }
  }
}
```

---

## Commissioner (`/commish`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| POST | `/commish/join` | `/api/commish/join` | ✅ | Join a league with invite code |
| GET | `/commish/manual-pick-data/<league_id>` | `/api/commish/manual-pick-data/<league_id>` | ✅ | Get data for manual pick entry |
| POST | `/commish/manual-pick` | `/api/commish/manual-pick` | ✅ | Submit a manual pick (commissioner only) |

### Request Bodies

**POST `/api/commish/join`**
```json
{
  "code": "INVITE_CODE_123"
}
```

**POST `/api/commish/manual-pick`**
```json
{
  "league_member_id": 123,
  "tournament_id": 456,
  "golfer_id": 789
}
```

### Example Responses

**POST `/api/commish/join`** (success)
```json
{
  "message": "Successfully joined league",
  "league_id": 1,
  "league_name": "Squilliam's League"
}
```

**POST `/api/commish/manual-pick`** (success)
```json
{
  "message": "Pick submitted successfully"
}
```

---

## Management (`/management`)

| Method | Raw URL | Proxy URL | Auth | Description |
|--------|---------|-----------|------|-------------|
| POST | `/management/create-user` | `/api/management/create-user` | ✅ | Create a new user in database (system endpoint) |

---

## Error Response Formats

### Standard Error
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Detailed Error
```json
{
  "success": false,
  "error": "Detailed error message",
  "message": "User-friendly message"
}
```

### Authentication Error (401)
```json
{
  "message": "Unauthorized",
  "error": "Invalid or missing authentication token"
}
```

### Forbidden Error (403)
```json
{
  "status": "error",
  "message": "Not authorized to view this league"
}
```

### Not Found Error (404)
```json
{
  "error": "No pick found"
}
```

---

## Notes

- All proxy URLs go through Next.js rewrites configured in `next.config.mjs`
- The rewrite rule: `/api/:path*` → `<CLOUD_RUN_URL>/:path*`
- For local development, uncomment the local rewrite in `next.config.mjs`
- Endpoints marked with ✅ Auth require the Firebase Bearer token
- Some endpoints are marked as DEPRECATED and will be removed in future versions
- Score values are stored as integers (multiplied by 100) and should be divided by 100 for display
