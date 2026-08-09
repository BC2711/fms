"""Create the configured PostgreSQL database when it does not exist."""

from sqlalchemy.engine import make_url

from app.core.config import get_settings


def main() -> None:
    import psycopg
    from psycopg import sql

    configured = make_url(get_settings().database_url)
    database = configured.database
    if not database:
        raise RuntimeError("FMS_DATABASE_URL must include a database name")
    admin_url = configured.set(database="postgres").render_as_string(hide_password=False).replace("postgresql+psycopg://", "postgresql://")
    with psycopg.connect(admin_url, autocommit=True) as connection:
        exists = connection.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database,)).fetchone()
        if exists:
            print(f"Database {database} already exists")
            return
        connection.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(database)))
        print(f"Created database {database}")


if __name__ == "__main__":
    main()
