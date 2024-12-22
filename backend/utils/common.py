from collections import defaultdict
from imghdr import tests as pic_format_function_list
from contextlib import asynccontextmanager
from functools import wraps
import logging
import time
import httpx


def patch_json():
    import json
    import ujson
    json.dumps = ujson.dumps
    json.loads = ujson.loads


def get_logger():
    return logging.getLogger("uvicorn")


def cache(expire: int = 3600):
    _d = {}

    def wrapper(func):
        @wraps(func)
        async def wrapped(*args, **kwargs):
            if _d.get("expire", 0) < time.time():
                _d['result'] = await func(*args, **kwargs)
                _d['expire'] = time.time() + expire
            return _d['result']

        return wrapped
    return wrapper


_client = None


@asynccontextmanager
async def AsyncClient():
    global _client
    if not _client:
        _client = httpx.AsyncClient()
    yield _client


def get_pic_format(pic_bytes: bytes):
    for func in pic_format_function_list:
        fmt = func(pic_bytes, '')
        if fmt:
            return fmt


def _convert_indexed_dict_to_list(d: dict):
    """
    index dict to list
    eg:
    """
    if not isinstance(d, dict):
        return
    for key in d.keys():
        value = d[key]
        try:
            # is array
            items = sorted([(int(k), v)
                           for k, v in value.items()], key=lambda x: x[0])
            for i, item in enumerate(items):
                if i != item[0]:
                    # not increasing from zero
                    return
            d[key] = [i[1] for i in items]
        except:
            # is dict
            _convert_indexed_dict_to_list(value)


def parse_query_params(parsed: dict):
    """
    Parse the query dict into a nested dictionary format.
    """
    result = defaultdict(dict)

    for key, value in parsed.items():
        # ['filters', '1'] = [1]
        # Parse keys like 'filters[role][0]' into ['filters', 'role', '0']
        keys = key.replace(
            '][', '/').replace('[', '/').replace(']', '').split('/')
        d = result
        for key in keys[:-1]:
            d[key] = d.get(key, dict())
            d = d[key]
        d[keys[-1]] = value[0]  # all value is list, take first

    _convert_indexed_dict_to_list(result)

    return dict(result)


if __name__ == "__main__":
    ...
