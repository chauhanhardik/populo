""" Paginatator methods for edX API implementations."""

from django.http import Http404
from django.core.paginator import Paginator, InvalidPage


def paginate_search_results(object_class, search_results, page_size, page):
    """
    Takes edx-search results and returns a Page object populated
    with db objects for that page.

    :param object_class: Model class to use when querying the db for objects.
    :param search_results: edX-search results.
    :param page_size: Number of results per page.
    :param page: Page number.
    :return: Paginator object with model objects
    """
    paginator = Paginator(search_results['results'], page_size)

    # This code is taken from within the GenericAPIView#paginate_queryset method.
    # It is common code, but
    try:
        page_number = paginator.validate_number(page)
    except InvalidPage:
        if page == 'last':
            page_number = paginator.num_pages
        else:
            raise Http404("Page is not 'last', nor can it be converted to an int.")

    try:
        paged_results = paginator.page(page_number)
    except InvalidPage as exception:
        raise Http404(
            "Invalid page {page_number}: {message}".format(
                page_number=page_number,
                message=str(exception)
            )
        )

    search_queryset_pks = [item['data']['pk'] for item in paged_results.object_list]
    queryset = object_class.objects.filter(pk__in=search_queryset_pks)

    def ordered_objects(primary_key):
        """ Returns database object matching the search result object"""
        for obj in queryset:
            if obj.pk == primary_key:
                return obj

    # map over the search results and get a list of database objects in the same order
    object_results = map(ordered_objects, search_queryset_pks)
    paged_results.object_list = object_results

    return paged_results
