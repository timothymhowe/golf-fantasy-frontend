import pandas as pd
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from src.api.models import League, LegacyMember, LegacyMemberPick, Golfer, Tournament
from src.api.utils.db_connector import db, init_db

THE_PATH = "~/Downloads/raw_fantasy.csv"


def create_league_and_members_and_picks_from_df(the_path):
    """
    Create a league object in the database.

    Args:
        db (SQLAlchemy): SQLAlchemy database object.

    Returns:
        None
    """

    raw = pd.read_csv(
        the_path,
        header=0,
        names=["display_name", "week_1", "week_2", "week_3", "week_4"],
    )

    league = League(
        name="Squilliam Fancyson",
        scoring_format="STANDARD",
        is_active=True,
    )

    # add the league to the session
    db.session.add(league)
    db.session.commit()

    # Split names and create a pandas DataFrame
    raw["last_name"] = [name.split(" ", 1)[1].lower() for name in raw["display_name"]]
    raw["first_name"] = [name.split(" ", 1)[0].lower() for name in raw["display_name"]]
    raw["user_name"] = [
        name.replace(" ", "_").lower().replace("'", "") for name in raw["display_name"]
    ]

    df = raw.reindex(
        columns=[
            "user_name",
            "display_name",
            "first_name",
            "last_name",
            "week_1",
            "week_2",
            "week_3",
            "week_4",
        ]
    )

    tournaments = Tournament.query.order_by(Tournament.start_date).limit(4).all()
    tournament_ids = [tournament.id for tournament in tournaments]

    # iterate over the rows in the DataFrame to create LegacyMember objects
    for _, row in df.iterrows():
        member = LegacyMember(
            league_id=league.id,
            user_name=row["user_name"],
            display_name=row["display_name"],
            first_name=row["first_name"],
            last_name=row["last_name"],
        )
        # add the LegacyMember object to the session
        db.session.add(member)

        # iterate over the week_1 to week_4 columns
        for week in range(1, 5):
            if row[f"week_{week}"] == "no pick":
                golfer_name = None
                golfer_id = None
                no_pick = True
            else:
                # query the Golfer table to find the golfer with a similar name
                golfer = Golfer.query.filter(
                    Golfer.full_name.like(f"%{row[f'week_{week}']}%")
                ).first()
                golfer_name = golfer.full_name if golfer else row[f"week_{week}"]
                golfer_id = golfer.id if golfer else None
                no_pick = False

            # create a new LegacyMemberPick object for each week
            pick = LegacyMemberPick(
                legacy_member_id=member.id,
                week=week,
                golfer_name=golfer_name,
                golfer_id=golfer_id,
                tournament_id=(
                    tournament_ids[week - 1] if week <= len(tournament_ids) else None
                ),
                no_pick=no_pick,
            )

            # add the LegacyMemberPick object to the session
            db.session.add(pick)

    db.session.commit()


if __name__ == "__main__":
    app = Flask(__name__)
    init_db(app)
    with app.app_context():
        create_league_and_members_and_picks_from_df(THE_PATH)
